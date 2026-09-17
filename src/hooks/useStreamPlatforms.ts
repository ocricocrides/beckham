import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type StreamPlatform = 'twitch' | 'youtube' | 'tiktok';

export const STREAM_PLATFORMS: StreamPlatform[] = ['twitch', 'youtube', 'tiktok'];

export const STREAM_PLATFORM_LABEL: Record<StreamPlatform, string> = {
  twitch: 'Twitch',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

/** Coluna do perfil onde o próprio membro cadastrou o link de cada plataforma. */
export const STREAM_PLATFORM_URL_COLUMN = {
  twitch: 'twitch_url',
  youtube: 'youtube_url',
  tiktok: 'tiktok_url',
} as const satisfies Record<StreamPlatform, string>;

/** Mapa membro -> plataformas em que ele transmite (marcadas pela ADM). */
export function useStreamPlatforms() {
  const [byMember, setByMember] = useState<Map<string, StreamPlatform[]> | null>(null);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('member_stream_platforms').select('member_id, platform');
    const map = new Map<string, StreamPlatform[]>();
    for (const row of data ?? []) {
      const list = map.get(row.member_id) ?? [];
      list.push(row.platform as StreamPlatform);
      map.set(row.member_id, list);
    }
    setByMember(map);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeTable('member_stream_platforms', reload);

  return { byMember: byMember ?? new Map<string, StreamPlatform[]>(), loading: byMember === null, reload };
}
