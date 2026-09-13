import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function CornerFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('group relative', className)}>
      {children}
      <span className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-line transition-colors duration-300 group-hover:border-brand group-focus-within:border-brand transform-gpu" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-line transition-colors duration-300 group-hover:border-brand group-focus-within:border-brand transform-gpu" />
    </div>
  );
}
