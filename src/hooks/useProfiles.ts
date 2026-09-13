import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MemberProfileWithRole } from '@/lib/supabase';
import { useRealtimeTable } from '@/context/RealtimeContext';

async function fetchAllProfiles(): Promise<MemberProfileWithRole[]> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*, roles(id, name, sort_order, color, discord_role_id)')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as MemberProfileWithRole[]).sort((a, b) => {
    const oa = a.roles ? a.roles.sort_order : Infinity;
    const ob = b.roles ? b.roles.sort_order : Infinity;
    if (oa !== ob) return oa - ob;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<MemberProfileWithRole[] | null>(null);

  const reload = useCallback(async () => {
    setProfiles(await fetchAllProfiles());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('member_profiles', reload);
  useRealtimeTable('roles', reload);

  return { profiles, loading: profiles === null, reload };
}
