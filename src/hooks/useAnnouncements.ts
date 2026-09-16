import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type Announcement = Tables<'announcements'>;

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    setAnnouncements(error || !data ? [] : data);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('announcements', reload);

  return { announcements, loading: announcements === null, reload };
}

/** Lixeira: só quem tem permissão de postar/apagar anúncio enxerga isso (a RLS já garante). */
export function useAnnouncementsTrash() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('created_at', { ascending: false });
    setAnnouncements(error || !data ? [] : data);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('announcements', reload);

  return { announcements, loading: announcements === null, reload };
}
