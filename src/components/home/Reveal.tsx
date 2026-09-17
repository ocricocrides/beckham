import type { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

/**
 * Seção que entra quando chega na tela: sobe, desembaça e cresce de leve, com curva "expo"
 * (rápida no começo, bem suave no fim). `delay` serve pra fazer cascata entre itens vizinhos.
 * Com "reduzir movimento" ligado no sistema, só o deslocamento/zoom sai; o aparecer continua.
 */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-[opacity,transform,filter] duration-[1100ms] ease-out-expo',
        inView
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 blur-[8px] motion-safe:translate-y-10 motion-safe:scale-[0.97]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Título padrão das seções da página inicial. */
export function HomeSectionHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-7">
      <div>
        <div className="text-brand text-[0.78rem] font-bold tracking-[3px] mb-2">{kicker}</div>
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink leading-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}
