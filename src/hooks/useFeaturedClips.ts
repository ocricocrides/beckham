import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type ClipCategory = Tables<'clip_categories'>;
export type ClipMember = Pick<Tables<'member_profiles'>, 'username' | 'display_name' | 'avatar_url'>;
export type FeaturedClip = Tables<'featured_clips'> & { member: ClipMember | null };

export function useFeaturedClips() {
  const [clips, setClips] = useState<FeaturedClip[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('featured_clips')
      .select('*, member:member_profiles(username, display_name, avatar_url)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setClips(error || !data ? [] : (data as FeaturedClip[]));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('featured_clips', reload);

  return { clips, loading: clips === null, reload };
}

/** Categorias dos clipes, criadas pela ADM na aba Destaques. */
export function useClipCategories() {
  const [categories, setCategories] = useState<ClipCategory[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('clip_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setCategories(error || !data ? [] : data);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('clip_categories', reload);

  return { categories: categories ?? [], loading: categories === null, reload };
}
