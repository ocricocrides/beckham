import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Toggle no estilo do site (blocos retos, aceso em brand) — substitui checkbox nativo. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        // Para quando o botão está dentro de um <label> clicável (evita alternar 2x no mesmo clique).
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        'relative inline-flex h-[18px] w-8 shrink-0 items-center border transition-colors cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'bg-brand border-brand' : 'bg-panel-2 border-line hover:border-ink-dim',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-3 w-3 bg-ink transition-transform duration-150',
          checked ? 'translate-x-[15px]' : 'translate-x-0.5',
        )}
      />
    </button>
  ),
);
Switch.displayName = 'Switch';
