import { useProfiles } from '@/hooks/useProfiles';
import { useRoles } from '@/hooks/useRoles';
import { usePageMeta } from '@/hooks/usePageMeta';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-panel-2 border border-line px-5 py-4">
      <div className="text-ink text-[1.8rem] font-bold font-display">{value}</div>
      <div className="text-ink-dim text-[0.78rem] tracking-wide uppercase mt-1">{label}</div>
    </div>
  );
}

export default function AdminInicioPage() {
  usePageMeta('Painel ADM', 'Área restrita de administração da BECKHAM.');
  const { profiles, loading: loadingProfiles } = useProfiles();
  const { roles, loading: loadingRoles } = useRoles();
  const admins = profiles?.filter((p) => p.is_admin).length ?? 0;

  return (
    <div>
      <h4 className="text-ink text-[1rem] tracking-wide mb-5">Visão geral</h4>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        <StatCard label="Membros" value={loadingProfiles ? '…' : (profiles?.length ?? 0)} />
        <StatCard label="Cargos" value={loadingRoles ? '…' : roles.length} />
        <StatCard label="Admins" value={loadingProfiles ? '…' : admins} />
      </div>
      <p className="text-ink-dim text-[0.85rem] mt-8">
        Mais configurações entram aqui com o tempo. Por enquanto, a gestão de cargos e membros está na aba{' '}
        <strong className="text-ink">Cargos</strong>.
      </p>
    </div>
  );
}
