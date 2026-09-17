import { useState } from 'react';
import { useInView } from '@/hooks/useInView';
import type { WeekPoint } from '@/hooks/useHomeStats';
import { cn } from '@/lib/utils';

function weekLabel(iso: string) {
  // A semana vem do banco como segunda 00:00 UTC; em UTC-3 isso cairia no domingo anterior.
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

/**
 * Barras de uma série só (uma por semana), na cor da marca. Sem legenda (o título nomeia a série);
 * o detalhe de cada semana aparece no hover/foco. As barras crescem quando o gráfico entra na tela.
 */
export function WeeklyBarChart({
  title,
  points,
  unit,
  detail,
}: {
  title: string;
  points: WeekPoint[];
  /** Ex: "membros", "ações" — usado no tooltip e na tabela acessível. */
  unit: string;
  /** Linha extra opcional no tooltip (ex: vitórias/derrotas). */
  detail?: (p: WeekPoint) => string | null;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.total));
  const total = points.reduce((sum, p) => sum + p.total, 0);
  const activePoint = active !== null ? points[active] : null;

  return (
    <div ref={ref} className="bg-panel border border-line p-5 relative">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="font-body text-ink text-[0.95rem] font-bold tracking-wide">{title}</h3>
        <span className="text-ink-dim text-[0.78rem]">
          {total} {unit} em 12 semanas
        </span>
      </div>

      <div className="relative h-[150px]">
        {/* Linhas de grade discretas: topo (máximo) e meio. */}
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/[0.06]" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/[0.06]" />
        {total > 0 && <span className="absolute -top-2 right-0 text-[0.65rem] text-ink-dim bg-panel pl-1">{max}</span>}

        <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
          {points.map((p, i) => {
            const h = p.total === 0 ? 0 : Math.max(4, (p.total / max) * 100);
            return (
              <button
                key={p.semana}
                type="button"
                aria-label={`Semana de ${weekLabel(p.semana)}: ${p.total} ${unit}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="relative flex-1 h-full flex items-end cursor-default outline-none group"
              >
                <span
                  className={cn(
                    'block w-full rounded-t-[4px] transition-[height,background-color,box-shadow] duration-[1100ms] ease-spring',
                    active === i ? 'bg-[#ff3d55] shadow-[0_0_18px_rgba(255,22,51,0.55)]' : 'bg-brand',
                    p.total === 0 && 'bg-transparent',
                  )}
                  style={{ height: inView ? `${h}%` : '0%', transitionDelay: inView && active === null ? `${200 + i * 60}ms` : '0ms' }}
                />
                {/* Base de 1px pra semana zerada não sumir do eixo. */}
                <span className="absolute bottom-0 inset-x-0 h-px bg-line" />
              </button>
            );
          })}
        </div>

        {activePoint && active !== null && (
          <div
            key={active}
            className="pointer-events-none absolute -top-2 z-10 bg-panel-2 border border-line px-2.5 py-1.5 text-[0.75rem] whitespace-nowrap shadow-[0_8px_20px_-8px_black] animate-in fade-in-0 duration-200"
            style={{
              left: `${((active + 0.5) / points.length) * 100}%`,
              transform: `translate(${active > points.length / 2 ? '-100%' : '0'}, -100%)`,
            }}
          >
            <div className="text-ink-dim">Semana de {weekLabel(activePoint.semana)}</div>
            <div className="text-ink font-bold">
              {activePoint.total} {unit}
            </div>
            {detail?.(activePoint) && <div className="text-ink-dim">{detail(activePoint)}</div>}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-2 text-[0.68rem] text-ink-dim">
        <span>{points[0] && weekLabel(points[0].semana)}</span>
        <span>esta semana</span>
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.semana}>
              <td>{weekLabel(p.semana)}</td>
              <td>{p.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
