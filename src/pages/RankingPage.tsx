import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { RankingList } from '@/components/ranking/RankingList';

export default function RankingPage() {
  return (
    <Wrap>
      <SectionHead title="Ranking" description="Winrate de ações por membro, calculado a partir do histórico registrado no Discord." />
      <RankingList />
    </Wrap>
  );
}
