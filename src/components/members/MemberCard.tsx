import type { MemberProfileWithRole } from '@/lib/supabase';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { GlowCard } from '@/components/glow-card/GlowCard';

export function MemberCard({ profile, onClick }: { profile: MemberProfileWithRole; onClick: () => void }) {
  return (
    <GlowCard
      className="border-transparent hover:border-transparent bg-panel rounded-md shadow-[0_1rem_2rem_-1rem_black] transition-colors hover:bg-panel-2 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <span className="pointer-events-none absolute -top-px -right-px w-1/2 h-1/2 rounded-tr-md border-t-2 border-r-2 border-line transition-colors duration-300 group-hover:border-brand" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-1/2 h-1/2 rounded-bl-md border-b-2 border-l-2 border-line transition-colors duration-300 group-hover:border-brand" />

      <div className="p-[26px_22px]">
        <div className="relative w-[52px] h-[52px] mb-4 rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:ring-brand overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center grayscale transition-all duration-300 group-hover:grayscale-0"
            style={{
              backgroundImage: `url('${profile.avatar_url || DEFAULT_AVATAR}')`,
              backgroundColor: '#1c1c1f',
            }}
          />
        </div>
        <h4 className="text-ink text-[1.05rem] font-semibold">{profile.display_name || profile.username}</h4>
        {profile.roles && (
          <div className="text-brand text-[0.78rem] font-bold tracking-wide my-1.5">{profile.roles.name.toUpperCase()}</div>
        )}
        <p className="text-ink-dim text-[0.88rem] leading-[1.5]">{profile.bio}</p>
      </div>
    </GlowCard>
  );
}
