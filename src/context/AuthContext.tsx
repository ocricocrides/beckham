import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { MemberProfile } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  profile: MemberProfile | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMyProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('member_profiles').select('*').eq('id', currentUser.id).maybeSingle();
    setProfile(data);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await ensureProfile(currentUser);
        await loadMyProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadMyProfile]);

  const refreshProfile = useCallback(() => loadMyProfile(user), [loadMyProfile, user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
