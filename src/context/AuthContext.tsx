import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, MEMBER_ROLES_SELECT, normalizeProfileRoles, isEffectiveAdmin, canReviewRegistrations } from '@/lib/supabase';
import type { MemberProfileWithRoles } from '@/lib/supabase';
import { useRealtimeTable } from '@/context/RealtimeContext';

interface AuthContextValue {
  user: User | null;
  profile: MemberProfileWithRoles | null;
  /** profile.is_admin OU algum cargo do membro com is_admin=true — o que realmente vale. */
  isAdmin: boolean;
  /** Registro aprovado pela staff no Discord: só membro usa o site como membro. */
  isMember: boolean;
  /** Pode abrir a aba de registros e aprovar/rejeitar por lá (admin ou permissão do cargo). */
  canReview: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User) {
  const { data: existing } = await supabase.from('member_profiles').select('id').eq('id', user.id).maybeSingle();
  if (existing) return;

  const raw = (user.user_metadata?.username as string | undefined) || user.email?.split('@')[0] || '';
  let username = raw.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);
  if (username.length < 3) username = `membro${user.id.slice(0, 6)}`;

  await supabase.from('member_profiles').insert({ id: user.id, username, display_name: username });
}

// Conta excluída (painel ADM ou bot) enquanto o navegador ainda guarda o login dela: o token local
// continua "válido" até vencer, mas o usuário não existe mais no Supabase. Sem isso a pessoa ficava
// presa numa sessão fantasma (logada, sem perfil, sem como criar conta nova). Só descarta a sessão
// quando o servidor diz que ela não vale mais; falha de rede não desloga ninguém. O signOut local
// não fala com o servidor (a conta já não existe lá) e dispara SIGNED_OUT.
async function descartarSessaoSeContaNaoExiste() {
  const { error } = await supabase.auth.getUser();
  if (error && (error.status === 401 || error.status === 403 || error.status === 404)) {
    await supabase.auth.signOut({ scope: 'local' });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfileWithRoles | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMyProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from('member_profiles')
      .select(MEMBER_ROLES_SELECT)
      .eq('id', currentUser.id)
      .maybeSingle();
    setProfile(data ? normalizeProfileRoles(data) : null);
    // setTimeout: chamar o Auth de dentro do onAuthStateChange trava o cliente.
    if (!data) setTimeout(() => void descartarSessaoSeContaNaoExiste(), 0);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        await ensureProfile(currentUser);
        await loadMyProfile(currentUser);
      } else {
        setProfile(null);
      }
      // O usuário só entra no estado depois do perfil carregado, pra não aparecer "logado sem perfil".
      setUser(currentUser);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadMyProfile]);

  const refreshProfile = useCallback(() => loadMyProfile(user), [loadMyProfile, user]);

  // Se um admin mudar os cargos de alguém (ou editar um cargo, ex: ligar/desligar o ADM dele)
  // em outra aba/sessão, quem está logado vê o próprio status atualizar sem recarregar a página.
  useRealtimeTable('member_roles', refreshProfile);
  useRealtimeTable('roles', refreshProfile);
  // Vínculo com o Discord e aprovação do registro chegam pelo bot, direto no perfil.
  useRealtimeTable('member_profiles', refreshProfile);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: isEffectiveAdmin(profile),
        isMember: !!profile?.is_member,
        canReview: canReviewRegistrations(profile),
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
