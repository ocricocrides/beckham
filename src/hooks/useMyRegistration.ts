import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type SiteRegistration = Database['public']['Tables']['site_registrations']['Row'];

/** Pedido de registro da própria conta (undefined = carregando, null = nunca enviou). */
export function useMyRegistration() {
  const { user } = useAuth();
  const [registration, setRegistration] = useState<SiteRegistration | null | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!user) {
      setRegistration(null);
      return;
    }
    const { data } = await supabase.from('site_registrations').select('*').eq('member_id', user.id).maybeSingle();
    setRegistration(data ?? null);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('site_registrations', reload);

  return { registration, reload };
}
