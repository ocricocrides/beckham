import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MEMBER_ROLES_SELECT, normalizeProfileRoles } from '@/lib/supabase';
import type { MemberProfileWithRoles } from '@/lib/supabase';
import { DEFAULT_BANNER } from '@/lib/constants';
import { Btn } from '@/components/layout/Btn';
import { BiolinkCard } from '@/components/profile/BiolinkCard';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';

export default function PerfilPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<MemberProfileWithRoles | null | undefined>(undefined);

  usePageMeta(
    profile ? profile.display_name || profile.username : username ? `@${username}` : 'Perfil',
    profile?.bio || `Perfil de ${username ? '@' + username : 'membro'} na BECKHAM.`,
  );

  useEffect(() => {
    if (!username) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setProfile(undefined);
    supabase
      .from('member_profiles')
      .select(MEMBER_ROLES_SELECT)
      .eq('username', username)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        // Conta sem registro aprovado não tem perfil público (só a própria pessoa e a ADM veem).
        const visivel = data && (data.is_member || data.id === user?.id || isAdmin);
        setProfile(visivel ? normalizeProfileRoles(data) : null);
      });
    return () => {
      cancelled = true;
    };
  }, [username, user?.id, isAdmin]);

  const bgImage = profile ? profile.banner_url || profile.avatar_url || DEFAULT_BANNER : null;

  return (
    <div className="flex-1 flex justify-center">
      {bgImage && (
        <div
          className="fixed inset-0 -z-10 bg-void bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImage}')`, filter: 'blur(70px) brightness(0.4) saturate(1.3)', transform: 'scale(1.2)' }}
        />
      )}
      <div className="w-full max-w-[720px] mx-auto px-[5vw] pt-10 pb-24 relative z-[1] self-center">
        <Btn variant="outline" className="mb-6" onClick={() => navigate('/membros')}>
          ← Voltar
        </Btn>
        {profile === undefined && <div className="skeleton h-[300px]" />}
        {profile === null && <p className="text-ink-dim">Perfil não encontrado.</p>}
        {profile && <BiolinkCard profile={profile} />}
      </div>
    </div>
  );
}
