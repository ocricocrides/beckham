import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { RankingList } from '@/components/ranking/RankingList';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function RankingPage() {
  usePageMeta('Ranking', 'Ranking de ações por membro, calculado a partir do histórico registrado no Discord.');
  return (
    <Wrap>
      <SectionHead title="Ranking" description="Winrate de ações por membro, calculado a partir do histórico registrado no Discord." />
      <RankingList />
    </Wrap>
  );
}
