import { useRanking } from '@/hooks/useRanking';

export function RankingList() {
  const { ranking, loading } = useRanking();

  if (loading) {
    return (
      <div className="mt-8 mb-20 flex flex-col gap-px bg-line border border-line">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-[52px]" />
        ))}
      </div>
    );
  }

  if (!ranking?.length) {
    return <p className="mt-8 text-ink-dim text-[0.85rem]">Nenhuma ação finalizada registrada ainda.</p>;
  }

  return (
    <div className="mt-8 mb-20 flex flex-col gap-px bg-line border border-line">
      {ranking.map((r, i) => {
        const nome = r.site_display_name || r.site_username || r.discord_tag || 'Membro desconhecido';
        return (
          <div key={r.discord_id} className="flex items-center gap-3.5 bg-panel px-5 py-3.5 flex-wrap hover:bg-panel-2">
            <div className="font-display font-bold text-brand w-7 flex-none">#{i + 1}</div>
            <div className="flex-1 min-w-[120px] text-ink font-semibold">{nome}</div>
            <div className="text-ink-dim text-[0.82rem]">
              {r.vitorias}V / {r.derrotas}D em {r.total}
            </div>
            <div className="font-display font-bold text-brand w-[70px] text-right flex-none">
              {Number(r.winrate).toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
