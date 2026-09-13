import type { MemberProfileWithRole } from '@/lib/supabase';
import { DEFAULT_AVATAR } from '@/lib/constants';

export function MemberCard({ profile, onClick }: { profile: MemberProfileWithRole; onClick: () => void }) {
  return (
    <div className="bg-panel p-[26px_22px] transition-colors hover:bg-panel-2 cursor-pointer" onClick={onClick}>
      <div
        className="w-[52px] h-[52px] mb-4 clip-corner-avatar bg-cover bg-center"
        style={{
          backgroundImage: `url('${profile.avatar_url || DEFAULT_AVATAR}')`,
          backgroundColor: '#1c1c1f',
        }}
      />
      <h4 className="text-ink text-[1.05rem] font-semibold">{profile.display_name || profile.username}</h4>
      {profile.roles && (
        <div className="text-brand text-[0.78rem] font-bold tracking-wide my-1.5">{profile.roles.name.toUpperCase()}</div>
      )}
      <p className="text-ink-dim text-[0.88rem] leading-[1.5]">{profile.bio}</p>
    </div>
  );
}
