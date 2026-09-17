import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlowCard } from './GlowCard';

/**
 * Moldura padrão dos cards do site (a mesma do card de Membros): fundo panel arredondado,
 * sombra, brilho seguindo o mouse e as duas cantoneiras (topo-direita e base-esquerda) que
 * acendem em vermelho no hover.
 */
export function BrandCard({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <GlowCard
      className={cn(
        'border-transparent hover:border-transparent bg-panel rounded-md shadow-[0_1rem_2rem_-1rem_black] transition-colors hover:bg-panel-2 overflow-hidden',
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute -top-px -right-px z-[2] w-9 h-9 rounded-tr-md border-t-2 border-r-2 border-line transition-colors duration-300 group-hover:border-brand transform-gpu" />
      <span className="pointer-events-none absolute -bottom-px -left-px z-[2] w-9 h-9 rounded-bl-md border-b-2 border-l-2 border-line transition-colors duration-300 group-hover:border-brand transform-gpu" />
      {children}
    </GlowCard>
  );
}
