import type { ChangeEvent, ReactNode, Ref } from 'react';
import { Label } from '@/components/ui/label';
import { CornerFrame } from '@/components/layout/CornerFrame';

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-[0.8rem] text-ink-dim tracking-wide font-body font-normal">
        {label}
      </Label>
      <CornerFrame>{children}</CornerFrame>
      {error && <p className="text-brand text-[0.75rem] -mt-1">{error}</p>}
    </div>
  );
}

export const inputClass =
  'font-body bg-panel-2 border border-transparent text-ink px-3 py-2.5 text-[0.95rem] rounded-none h-auto ' +
  'ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent focus-visible:outline-none';

/**
 * Campo de arquivo em que só o botão vermelho abre o seletor — o resto da caixa
 * não é clicável. O <input type="file"> nativo abriria o seletor em qualquer
 * ponto dele, então ele fica escondido e o clique vem do <label>.
 */
export function FileInput({
  id,
  accept,
  fileName,
  inputRef,
  onChange,
}: {
  id: string;
  accept?: string;
  fileName?: string | null;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="font-body bg-panel-2 border border-transparent text-ink-dim px-3 py-2.5 text-[0.95rem] flex items-center gap-3">
      <input ref={inputRef} id={id} type="file" accept={accept} onChange={onChange} className="peer sr-only" />
      <label
        htmlFor={id}
        className="shrink-0 cursor-pointer bg-brand text-[#0a0a0a] font-bold tracking-wide px-3 py-1.5 transition-colors hover:bg-[#ff3d55] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
      >
        Escolher arquivo
      </label>
      <span className="truncate">{fileName || 'Nenhum arquivo escolhido'}</span>
    </div>
  );
}
