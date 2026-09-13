import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Spotlight/glow effect that tracks the pointer, ported from the open-source
 * "GlowCard" component the user wanted to use. The trick: --x/--y are raw
 * viewport pointer coordinates, and the radial-gradient + background-attachment:fixed
 * combo makes the glow track the cursor regardless of the card's own position/scroll.
 * Colors are hardcoded to the site's brand red instead of the original's color prop.
 */
export function GlowCard({ children, className, ...props }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      cardRef.current?.style.setProperty('--x', e.clientX.toFixed(2));
      cardRef.current?.style.setProperty('--y', e.clientY.toFixed(2));
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  return (
    <div ref={cardRef} data-glow className={cn('relative', className)} {...props}>
      <div data-glow />
      {children}
    </div>
  );
}
