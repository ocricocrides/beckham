import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type CrewPhoto = Tables<'crew_photos'>;

export function useGallery() {
  const [photos, setPhotos] = useState<CrewPhoto[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from('crew_photos').select('*').order('created_at', { ascending: false });
    setPhotos(error || !data ? [] : data);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('crew_photos', reload);

  return { photos, loading: photos === null, reload };
}
