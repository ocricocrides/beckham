import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/lib/supabase';
import { useRealtimeTable } from '@/context/RealtimeContext';

export function useRoles() {
  const [roles, setRoles] = useState<Role[] | null>(null);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('roles').select('*').order('sort_order', { ascending: true });
    setRoles(data || []);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('roles', reload);

  return { roles: roles ?? [], loading: roles === null, reload };
}
