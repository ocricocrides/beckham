import { useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlowCard({ children, className, onMouseMove, ...props }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      ref.current!.style.setProperty('--x', `${e.clientX - rect.left}px`);
      ref.current!.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden border border-line transition-colors duration-200 hover:border-brand/50',
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(220px circle at var(--x, 50%) var(--y, 50%), rgba(255,22,51,0.12), transparent 70%)',
        }}
      />
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
