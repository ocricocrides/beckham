import { Btn } from '@/components/layout/Btn';
import { useHomeStats } from '@/hooks/useHomeStats';
import { TICKET_URL } from '@/lib/constants';
import { CountUp } from './CountUp';
import { HomeSectionHead, Reveal } from './Reveal';
import { WeeklyBarChart } from './WeeklyBarChart';

function Tile({ label, value, suffix, hint }: { label: string; value: number; suffix?: string; hint?: string }) {
  return (
    <div className="h-full bg-panel border border-line px-5 py-4 transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:border-brand/60 hover:shadow-[0_14px_30px_-18px_rgba(255,22,51,0.6)]">
      <CountUp value={value} suffix={suffix} className="block text-brand text-[2rem] leading-none font-bold font-display" />
      <div className="text-ink text-[0.8rem] tracking-wide uppercase mt-2 font-bold">{label}</div>
      {hint && <div className="text-ink-dim text-[0.72rem] mt-0.5">{hint}</div>}
    </div>
  );
}

export function HomeDashboard() {
  const { stats, loading } = useHomeStats();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 min-[900px]:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[96px]" />
        ))}
      </div>
    );
  }

  const winrate = stats.acoes_total > 0 ? Math.round((stats.acoes_vitorias / stats.acoes_total) * 100) : 0;

  return (
    <>
      <Reveal>
        <HomeSectionHead kicker="EM NÚMEROS" title="A BECKHAM crescendo">
          <Btn asChild variant="outline">
            <a href={TICKET_URL} target="_blank" rel="noopener noreferrer">
              Quero fazer parte
            </a>
          </Btn>
        </HomeSectionHead>
      </Reveal>

      <div className="grid grid-cols-2 min-[900px]:grid-cols-4 gap-3">
        <Reveal delay={0}>
          <Tile label="Membros no site" value={stats.membros_total} hint="com perfil criado" />
        </Reveal>
        <Reveal delay={90}>
          <Tile label="Streamers" value={stats.streamers_total} hint="criando conteúdo pela fac" />
        </Reveal>
        <Reveal delay={180}>
          <Tile label="Ações registradas" value={stats.acoes_total} hint="com resultado no Discord" />
        </Reveal>
        <Reveal delay={270}>
          {stats.recrutamentos_30d > 0 ? (
            <Tile label="Pedidos pra entrar" value={stats.recrutamentos_30d} hint="nos últimos 30 dias" />
          ) : (
            <Tile label="Winrate" value={winrate} suffix="%" hint="das ações registradas" />
          )}
        </Reveal>
      </div>

      <div className="grid min-[900px]:grid-cols-2 gap-3 mt-3">
        <Reveal delay={150}>
          <WeeklyBarChart title="Novos membros por semana" points={stats.membros_por_semana} unit="membros" />
        </Reveal>
        <Reveal delay={300}>
          <WeeklyBarChart
            title="Ações por semana"
            points={stats.acoes_por_semana}
            unit="ações"
            detail={(p) => (p.total > 0 ? `${p.vitorias ?? 0} vitórias · ${p.derrotas ?? 0} derrotas` : null)}
          />
        </Reveal>
      </div>
    </>
  );
}
