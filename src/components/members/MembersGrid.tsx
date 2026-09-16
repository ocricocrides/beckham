import { useProfiles } from '@/hooks/useProfiles';
import { MemberCard } from './MemberCard';
import type { MemberProfileWithRoles } from '@/lib/supabase';

export function MembersGrid({ onSelect }: { onSelect: (profile: MemberProfileWithRoles) => void }) {
  const { profiles, loading } = useProfiles();

  return (
    <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[220px] rounded-2xl" />)
        : profiles!.map((p) => <MemberCard key={p.id} profile={p} onClick={() => onSelect(p)} />)}
    </div>
  );
}
