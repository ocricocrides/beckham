import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-[0.8rem] text-ink-dim tracking-wide font-body font-normal">
        {label}
      </Label>
      {children}
    </div>
  );
}

export const inputClass =
  'font-body bg-panel-2 border border-line text-ink px-3 py-2.5 text-[0.95rem] rounded-none h-auto focus-visible:ring-0 focus-visible:border-brand focus-visible:outline-none';
