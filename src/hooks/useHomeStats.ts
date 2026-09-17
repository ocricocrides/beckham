import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRealtimeTable } from '@/context/RealtimeContext';

export interface WeekPoint {
  semana: string;
  total: number;
  vitorias?: number;
  derrotas?: number;
}

export interface HomeStats {
  membros_total: number;
  streamers_total: number;
  acoes_total: number;
  acoes_vitorias: number;
  acoes_derrotas: number;
  recrutamentos_30d: number;
  membros_por_semana: WeekPoint[];
  acoes_por_semana: WeekPoint[];
}

/** Números agregados da dashboard da página inicial (função site_home_stats no banco). */
export function useHomeStats() {
  const [stats, setStats] = useState<HomeStats | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.rpc('site_home_stats');
    if (!error && data) setStats(data as unknown as HomeStats);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('member_profiles', reload);
  useRealtimeTable('member_roles', reload);
  useRealtimeTable('action_ranking', reload);

  return { stats, loading: stats === null };
}
