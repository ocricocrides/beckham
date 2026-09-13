import { useNavigate } from 'react-router-dom';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { AccountsBar } from '@/components/members/AccountsBar';
import { MembersGrid } from '@/components/members/MembersGrid';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function MembrosPage() {
  const navigate = useNavigate();
  usePageMeta('Membros', 'Quem faz parte da BECKHAM hoje: cargos, perfis e contas de cada membro.');

  return (
    <Wrap>
      <SectionHead title="Membros" description="Quem faz parte da BECKHAM hoje." />
      <AccountsBar />
      <MembersGrid onSelect={(p) => navigate(`/perfil/${p.username}`)} />
    </Wrap>
  );
}
