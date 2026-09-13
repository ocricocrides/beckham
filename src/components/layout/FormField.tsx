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

export const fileInputClass =
  'font-body bg-panel-2 border border-brand/50 text-ink-dim px-3 py-2.5 text-[0.95rem] rounded-none h-auto cursor-pointer ' +
  'file:mr-3 file:cursor-pointer file:border-0 file:bg-brand file:text-[#0a0a0a] file:font-bold file:tracking-wide file:px-3 file:py-1.5 ' +
  'focus-visible:ring-0 focus-visible:border-brand focus-visible:outline-none';
