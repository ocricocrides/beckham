import type { ReactNode } from 'react';

export function Wrap({ children }: { children: ReactNode }) {
  // w-full é essencial aqui: o pai (Layout) é um flex-column, e um item flex com margin
  // auto (o mx-auto) perde o stretch padrão e encolhe pro tamanho do conteúdo em vez de
  // ocupar a largura disponível — sem isso a página inteira fica mais estreita do que devia.
  return <div className="w-full max-w-[1180px] mx-auto px-[5vw]">{children}</div>;
}

export function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-16 pb-10 flex items-end justify-between border-b border-line flex-wrap gap-4">
      <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-ink">{title}</h2>
      <p className="text-ink-dim max-w-[360px] text-base">{description}</p>
    </div>
  );
}
