import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { Btn } from '@/components/layout/Btn';
import { FilterTabs } from '@/components/home/ClipsSection';
import { Reveal } from '@/components/home/Reveal';
import { BrandCard } from '@/components/glow-card/BrandCard';
import { SocialIcon } from '@/components/profile/SocialIcon';
import { useProfiles } from '@/hooks/useProfiles';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  useStreamPlatforms,
  STREAM_PLATFORMS,
  STREAM_PLATFORM_LABEL,
  STREAM_PLATFORM_URL_COLUMN,
  type StreamPlatform,
} from '@/hooks/useStreamPlatforms';
import { DEFAULT_AVATAR, DEFAULT_BANNER, TICKET_URL } from '@/lib/constants';
import type { MemberProfileWithRoles } from '@/lib/supabase';

type Tab = 'todos' | StreamPlatform;

const PLATFORM_COLOR: Record<StreamPlatform, string> = {
  twitch: '#9146ff',
  youtube: '#ff0000',
  tiktok: '#f2f1ee',
};

function StreamerCard({ profile, platforms }: { profile: MemberProfileWithRoles; platforms: StreamPlatform[] }) {
  const principal = profile.roles.find((r) => r.tipo === 'principal');
  const links = platforms
    .map((p) => ({ platform: p, url: profile[STREAM_PLATFORM_URL_COLUMN[p]] }))
    .filter((l): l is { platform: StreamPlatform; url: string } => !!l.url);

  return (
    <BrandCard className="h-full">
      <div className="h-full flex flex-col">
        <div
          className="h-[110px] bg-cover bg-center opacity-70 transition-[transform,opacity] duration-[900ms] ease-out-expo group-hover:opacity-100 group-hover:scale-110"
          style={{
            backgroundImage: `url('${profile.banner_url || DEFAULT_BANNER}')`,
          }}
        />
        <div className="px-5 pb-5 flex-1 flex flex-col">
          <img
            src={profile.avatar_url || DEFAULT_AVATAR}
            alt=""
            className="-mt-9 w-[72px] h-[72px] rounded-full object-cover border-[3px] border-panel ring-2 ring-brand/60 bg-[#1c1c1f] relative transition-[transform,box-shadow] duration-500 ease-spring group-hover:scale-105 group-hover:ring-brand group-hover:shadow-[0_0_24px_rgba(255,22,51,0.45)]"
          />
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <h3 className="font-body text-ink text-[1.15rem] font-bold">{profile.display_name || profile.username}</h3>
            <span className="text-[0.62rem] font-bold tracking-[1.5px] text-[#0a0a0a] bg-brand px-1.5 py-0.5">
              STREAMER BECKHAM
            </span>
          </div>
          {principal && (
            <div
              className="text-[0.75rem] font-bold tracking-wide mt-0.5"
              style={{ color: principal.color || undefined }}
            >
              {principal.name.toUpperCase()}
            </div>
          )}
          {profile.bio && <p className="text-ink-dim text-[0.85rem] leading-[1.5] mt-2 line-clamp-3">{profile.bio}</p>}

          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {links.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-line hover:border-brand bg-void/60 px-3 py-1.5 text-[0.8rem] font-bold text-ink transition-colors"
              >
                <span style={{ color: PLATFORM_COLOR[platform] }}>
                  <SocialIcon kind={platform} />
                </span>
                {STREAM_PLATFORM_LABEL[platform]}
              </a>
            ))}
            <Link
              to={`/perfil/${profile.username}`}
              className="flex items-center px-3 py-1.5 text-[0.8rem] font-bold text-ink-dim hover:text-brand transition-colors"
            >
              Ver perfil →
            </Link>
          </div>
        </div>
      </div>
    </BrandCard>
  );
}

export default function StreamersPage() {
  usePageMeta('Streamers', 'Os criadores de conteúdo da BECKHAM na Twitch, no YouTube e no TikTok.');
  const { profiles, loading: loadingProfiles } = useProfiles();
  const { byMember, loading: loadingPlatforms } = useStreamPlatforms();
  const [tab, setTab] = useState<Tab>('todos');

  const streamers = useMemo(() => (profiles ?? []).filter((p) => p.roles.some((r) => r.is_streamer)), [profiles]);

  const inPlatform = (p: MemberProfileWithRoles, platform: StreamPlatform) =>
    (byMember.get(p.id) ?? []).includes(platform) && !!p[STREAM_PLATFORM_URL_COLUMN[platform]];

  const visible = tab === 'todos' ? streamers : streamers.filter((p) => inPlatform(p, tab));
  const loading = loadingProfiles || loadingPlatforms;

  return (
    <Wrap>
      <SectionHead title="Streamers" description="Quem leva o nome da BECKHAM pras lives e pros vídeos." />

      {/* Chamada pra recrutamento de criadores: vai direto pro canal de ticket no Discord. */}
      <Reveal className="mt-8">
        <BrandCard>
          <div className="px-6 py-5 flex items-center justify-between gap-5 flex-wrap">
            <div className="max-w-[640px]">
              <div className="text-brand text-[0.75rem] font-bold tracking-[3px] mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand animate-live-dot" />
                TIME DE CRIADORES
              </div>
              <p className="text-ink text-[1.05rem] leading-[1.5] font-semibold [text-wrap:balance]">
                Interessado em fazer parte do nosso time de criadores de conteúdo? Entre em contato com os líderes
                abrindo um ticket no nosso servidor do Discord.
              </p>
            </div>
            <Btn asChild variant="primary">
              <a href={TICKET_URL} target="_blank" rel="noopener noreferrer">
                Abrir ticket
              </a>
            </Btn>
          </div>
        </BrandCard>
      </Reveal>

      <div className="mt-8">
        <FilterTabs
          options={[
            { id: 'todos' as Tab, label: 'Todos', count: streamers.length },
            ...STREAM_PLATFORMS.map((p) => ({
              id: p as Tab,
              label: STREAM_PLATFORM_LABEL[p],
              count: streamers.filter((s) => inPlatform(s, p)).length,
            })),
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-6 pb-20 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-[300px]" />)
          : visible.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 110}>
                <StreamerCard profile={p} platforms={tab === 'todos' ? (byMember.get(p.id) ?? []) : [tab]} />
              </Reveal>
            ))}
      </div>
      {!loading && visible.length === 0 && (
        <p className="text-ink-dim text-[0.95rem] -mt-14 pb-20">
          {tab === 'todos'
            ? 'Nenhum streamer ainda. Pode ser você: abre um ticket no Discord.'
            : `Ninguém transmitindo no ${STREAM_PLATFORM_LABEL[tab]} por enquanto.`}
        </p>
      )}
    </Wrap>
  );
}
