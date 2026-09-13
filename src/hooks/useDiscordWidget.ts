import { useEffect, useState } from 'react';
import { DISCORD_GUILD_ID } from '@/lib/constants';

interface DiscordWidget {
  presenceCount: number;
  inviteUrl: string | null;
}

export function useDiscordWidget() {
  const [widget, setWidget] = useState<DiscordWidget | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setWidget({ presenceCount: data.presence_count, inviteUrl: data.instant_invite ?? null });
      })
      .catch(() => {
        /* widget disabled or offline — fail silently, matches legacy behavior */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return widget;
}
