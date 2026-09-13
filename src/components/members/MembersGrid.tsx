import { useProfiles } from '@/hooks/useProfiles';
import { MemberCard } from './MemberCard';
import type { MemberProfileWithRole } from '@/lib/supabase';

export function MembersGrid({ onSelect }: { onSelect: (profile: MemberProfileWithRole) => void }) {
  const { profiles, loading } = useProfiles();

  return (
    <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-px bg-line border border-line">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[150px]" />)
        : profiles!.map((p) => <MemberCard key={p.id} profile={p} onClick={() => onSelect(p)} />)}
    </div>
  );
}
