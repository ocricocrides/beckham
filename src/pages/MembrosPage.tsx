import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { AccountsBar } from '@/components/members/AccountsBar';

export default function MembrosPage() {
  return (
    <Wrap>
      <SectionHead title="Membros" description="Quem forma a BECKHAM hoje — do fundador aos associados mais recentes." />
      <AccountsBar />
      <p className="mt-8 text-ink-dim">A grade de membros chega na Etapa 4 (dados + realtime).</p>
    </Wrap>
  );
}
