import { useNavigate } from 'react-router-dom';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { AccountsBar } from '@/components/members/AccountsBar';
import { MembersGrid } from '@/components/members/MembersGrid';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function MembrosPage() {
  const navigate = useNavigate();
  useDocumentTitle('Membros');

  return (
    <Wrap>
      <SectionHead title="Membros" description="Quem forma a BECKHAM hoje — do fundador aos associados mais recentes." />
      <AccountsBar />
      <MembersGrid onSelect={(p) => navigate(`/perfil/${p.username}`)} />
    </Wrap>
  );
}
