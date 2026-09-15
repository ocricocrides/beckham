import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MEMBER_ROLES_SELECT, normalizeProfileRoles } from '@/lib/supabase';
import type { MemberProfileWithRoles } from '@/lib/supabase';
import { useRealtimeTable } from '@/context/RealtimeContext';

async function fetchAllProfiles(): Promise<MemberProfileWithRoles[]> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select(MEMBER_ROLES_SELECT)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map(normalizeProfileRoles).sort((a, b) => {
    const oa = a.roles[0] ? a.roles[0].sort_order : Infinity;
    const ob = b.roles[0] ? b.roles[0].sort_order : Infinity;
    if (oa !== ob) return oa - ob;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<MemberProfileWithRoles[] | null>(null);

  const reload = useCallback(async () => {
    setProfiles(await fetchAllProfiles());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('member_profiles', reload);
  useRealtimeTable('roles', reload);
  useRealtimeTable('member_roles', reload);

  return { profiles, loading: profiles === null, reload };
}
