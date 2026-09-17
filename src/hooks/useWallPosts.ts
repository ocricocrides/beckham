import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type WallPost = Tables<'wall_posts'> & {
  member: Pick<Tables<'member_profiles'>, 'username' | 'display_name' | 'avatar_url'> | null;
};

export function useWallPosts(limit = 30) {
  const [posts, setPosts] = useState<WallPost[] | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('wall_posts')
      .select('*, member:member_profiles(username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(limit);
    setPosts(error || !data ? [] : (data as WallPost[]));
  }, [limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('wall_posts', reload);
  useRealtimeTable('member_profiles', reload);

  return { posts, loading: posts === null, reload };
}
