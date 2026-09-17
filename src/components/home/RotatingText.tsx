import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

/** De quanto em quanto tempo TODOS os textos girando trocam, juntos. */
const INTERVAL_MS = 4200;
/** Quanto tempo antes da troca as frases atuais começam a sair. */
const EXIT_MS = 550;
/** Atraso entre uma letra e a próxima na entrada. */
const CHAR_STAGGER_MS = 22;

/**
 * Relógio compartilhado: um único timer pra página inteira. Todo RotatingText renderizado lê
 * o mesmo "tick", então saem e entram na mesma hora. O timer só roda enquanto houver algum
 * texto girando na tela e para sozinho quando o último desmonta.
 */
const clock = {
  tick: 0,
  leaving: false,
  snapshot: { tick: 0, leaving: false },
  listeners: new Set<() => void>(),
  intervalId: undefined as ReturnType<typeof setInterval> | undefined,
  exitId: undefined as ReturnType<typeof setTimeout> | undefined,

  emit() {
    clock.snapshot = { tick: clock.tick, leaving: clock.leaving };
    clock.listeners.forEach((fn) => fn());
  },

  subscribe(listener: () => void) {
    clock.listeners.add(listener);
    if (clock.listeners.size === 1) {
      clock.intervalId = setInterval(() => {
        clock.leaving = true;
        clock.emit();
        clock.exitId = setTimeout(() => {
          clock.tick += 1;
          clock.leaving = false;
          clock.emit();
        }, EXIT_MS);
      }, INTERVAL_MS);
    }
    return () => {
      clock.listeners.delete(listener);
      if (clock.listeners.size === 0) {
        clearInterval(clock.intervalId);
        clearTimeout(clock.exitId);
        clock.leaving = false;
        clock.emit();
      }
    };
  },
};

/**
 * Troca de frase em loop, sincronizada com todos os outros RotatingText da tela. A frase nova
 * entra letra por letra (sobe, desembaça e assenta) e, um pouco antes da troca, a atual sai
 * inteira pra cima desfocando. Com "reduzir movimento" ligado no sistema (padrão em muito
 * Windows) não há deslocamento, mas o aparecer/desembaçar continua.
 */
export function RotatingText({ items, className }: { items: string[]; className?: string }) {
  const { tick, leaving } = useSyncExternalStore(clock.subscribe, () => clock.snapshot);

  const index = items.length ? tick % items.length : 0;
  const current = items[index] ?? '';
  // Separa por palavra pra quebra de linha acontecer entre palavras, nunca no meio de uma.
  const words = current.split(' ');
  let charCount = 0;

  return (
    // O grid empilha todas as frases na mesma célula (invisíveis): a altura fica a da maior
    // e o layout embaixo não pula quando a frase troca de tamanho.
    <span className={cn('grid', className)}>
      {items.map((item) => (
        <span key={`ghost-${item}`} aria-hidden className="invisible [grid-area:1/1]">
          {item}
        </span>
      ))}
      <span className="sr-only" aria-live="polite">
        {current}
      </span>
      <span
        key={index}
        aria-hidden
        className={cn(
          '[grid-area:1/1] transition-[opacity,transform,filter] ease-out-expo',
          leaving
            ? 'opacity-0 motion-safe:-translate-y-2 blur-[6px] duration-500'
            : 'opacity-100 translate-y-0 blur-0 duration-300',
        )}
      >
        {words.map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, c) => {
              const delay = charCount++ * CHAR_STAGGER_MS;
              return (
                <span
                  key={c}
                  className="inline-block motion-safe:animate-[charIn_700ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-[charFade_600ms_ease-out_both]"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {ch}
                </span>
              );
            })}
            {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </span>
  );
}
