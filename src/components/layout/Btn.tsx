import { forwardRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const base =
  'font-body font-bold tracking-wide text-[0.9rem] px-[22px] py-[11px] h-auto rounded-none border border-line bg-transparent text-ink clip-corner-sm hover:bg-transparent hover:border-brand transition-colors';

const variants = {
  outline: 'bg-brand/[0.06]',
  primary: 'bg-brand border-brand text-[#0a0a0a] hover:bg-[#ff3d55] hover:border-[#ff3d55]',
} as const;

export interface BtnProps extends ButtonProps {
  variant?: keyof typeof variants;
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(({ className, variant, ...props }, ref) => (
  <Button ref={ref} className={cn(base, variant && variants[variant], className)} {...props} />
));
Btn.displayName = 'Btn';
