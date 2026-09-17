import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Velocidade do deslize, em pixels por segundo (a duração acompanha o tamanho do título). */
const PX_PER_SECOND = 28;

/**
 * Título que desliza como nos cards do Spotify: se cabe, fica parado; se não cabe, fica parado
 * um instante, desliza até mostrar o final, para e volta, em loop. As bordas somem num degradê.
 */
export function ScrollingTitle({ text, className }: { text: string; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    const span = textRef.current;
    if (!box || !span) return;
    const measure = () => setOverflow(Math.max(0, Math.ceil(span.scrollWidth - box.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(span);
    return () => ro.disconnect();
  }, [text]);

  const scrolls = overflow > 0;
  // Ida + pausas: a animação é "alternate", então cada ciclo é só uma ida (ou uma volta).
  const duration = Math.max(4, (overflow / PX_PER_SECOND) / 0.64);

  return (
    <div
      ref={boxRef}
      className={cn('overflow-hidden whitespace-nowrap', className)}
      style={
        scrolls
          ? {
              maskImage: 'linear-gradient(90deg, transparent, black 10px, black calc(100% - 14px), transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10px, black calc(100% - 14px), transparent)',
            }
          : undefined
      }
    >
      <span
        ref={textRef}
        key={text}
        className={cn('inline-block', scrolls && 'animate-[titleScroll_var(--scroll-time)_ease-in-out_infinite_alternate]')}
        style={
          {
            '--scroll-dist': `-${overflow}px`,
            '--scroll-time': `${duration}s`,
            paddingInline: scrolls ? '10px 14px' : undefined,
          } as React.CSSProperties
        }
      >
        {text}
      </span>
    </div>
  );
}
