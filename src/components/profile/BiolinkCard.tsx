import { useState } from 'react';
import { Btn } from '@/components/layout/Btn';
import { SocialIcon, type SocialKind } from './SocialIcon';
import { MusicEmbed } from './MusicEmbed';
import { GlowCard } from '@/components/glow-card/GlowCard';
import { DEFAULT_AVATAR, DEFAULT_BANNER } from '@/lib/constants';
import type { MemberProfileWithRole } from '@/lib/supabase';

export function BiolinkCard({ profile }: { profile: MemberProfileWithRole }) {
  const [copyLabel, setCopyLabel] = useState('Copiar link do perfil');
  const bannerSrc = profile.banner_url || DEFAULT_BANNER;
  const avatarSrc = profile.avatar_url || DEFAULT_AVATAR;

  const socials: [SocialKind, string][] = (
    [
      ['instagram', profile.instagram_url],
      ['x', profile.x_url],
      ['youtube', profile.youtube_url],
      ['twitch', profile.twitch_url],
      ['discord', profile.discord_url],
    ] as [SocialKind, string | null][]
  ).filter((s): s is [SocialKind, string] => Boolean(s[1]));

  async function handleCopy() {
    const url = `${location.origin}/perfil/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyLabel('Link copiado!');
    } catch {
      prompt('Copie o link do perfil:', url);
    }
    setTimeout(() => setCopyLabel('Copiar link do perfil'), 2000);
  }

  return (
    <GlowCard className="bg-panel overflow-hidden">
      <div
        className="relative z-[1] h-[150px] bg-[#0b0b0c] bg-cover bg-center [filter:saturate(1.1)]"
        style={{ backgroundImage: `url('${bannerSrc}')` }}
      />
      <div className="px-7 pb-8 text-center">
        <div
          className="relative z-[2] w-24 h-24 -mt-12 mb-4 mx-auto rounded-full border-[3px] border-panel bg-cover bg-center bg-[#1c1c1f]"
          style={{ backgroundImage: `url('${avatarSrc}')` }}
        />
        <h2 className="text-[1.5rem] text-ink">{profile.display_name || profile.username}</h2>
        {profile.roles && (
          <div className="text-brand font-bold text-[0.8rem] tracking-wide mt-1.5">{profile.roles.name.toUpperCase()}</div>
        )}
        {profile.location && <div className="text-ink-dim text-[0.85rem] mt-2">📍 {profile.location}</div>}
        {profile.bio && <p className="text-ink-dim text-[0.95rem] leading-[1.6] mt-[18px]">{profile.bio}</p>}
        {socials.length > 0 && (
          <div className="flex justify-center gap-4 mt-5">
            {socials.map(([kind, url]) => (
              <a
                key={kind}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-dim hover:text-brand transition-colors"
              >
                <SocialIcon kind={kind} />
              </a>
            ))}
          </div>
        )}
        {profile.music_url && <MusicEmbed url={profile.music_url} />}
        <Btn variant="outline" className="mt-6 w-full" onClick={handleCopy}>
          {copyLabel}
        </Btn>
      </div>
    </GlowCard>
  );
}
