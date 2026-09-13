import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type RankingRow = Tables<'action_ranking'>;

export function useRanking() {
  const [ranking, setRanking] = useState<RankingRow[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from('action_ranking').select('*').order('winrate', { ascending: false });
    setRanking(error || !data ? [] : data);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('action_ranking', reload);

  return { ranking, loading: ranking === null, reload };
}
