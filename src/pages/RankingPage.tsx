import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { RankingList } from '@/components/ranking/RankingList';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function RankingPage() {
  useDocumentTitle('Ranking');
  return (
    <Wrap>
      <SectionHead title="Ranking" description="Winrate de ações por membro, calculado a partir do histórico registrado no Discord." />
      <RankingList />
    </Wrap>
  );
}
