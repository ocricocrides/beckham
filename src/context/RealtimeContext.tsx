import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type TableName =
  | 'member_profiles'
  | 'roles'
  | 'member_roles'
  | 'crew_photos'
  | 'announcements'
  | 'action_ranking'
  | 'member_stream_platforms'
  | 'featured_clips'
  | 'clip_categories'
  | 'wall_posts'
  | 'site_registrations';
type Listener = () => void;

interface RealtimeContextValue {
  subscribe: (table: TableName, listener: Listener) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef<Map<TableName, Set<Listener>>>(new Map());

  useEffect(() => {
    const tables: TableName[] = [
      'member_profiles',
      'roles',
      'member_roles',
      'crew_photos',
      'announcements',
      'action_ranking',
      'member_stream_platforms',
      'featured_clips',
      'clip_categories',
      'wall_posts',
      'site_registrations',
    ];
    let channel = supabase.channel('site-changes');
    for (const table of tables) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        listenersRef.current.get(table)?.forEach((fn) => fn());
      });
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      subscribe(table, listener) {
        if (!listenersRef.current.has(table)) listenersRef.current.set(table, new Set());
        listenersRef.current.get(table)!.add(listener);
        return () => listenersRef.current.get(table)?.delete(listener);
      },
    }),
    [],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeTable(table: TableName, onChange: Listener) {
  const ctx = useContext(RealtimeContext);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ctx) return;
    return ctx.subscribe(table, () => onChangeRef.current());
  }, [ctx, table]);
}
