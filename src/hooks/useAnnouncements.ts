import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type Announcement = Tables<'announcements'>;

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(error || !data ? [] : data);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('announcements', reload);

  return { announcements, loading: announcements === null, reload };
}
