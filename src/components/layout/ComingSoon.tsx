import { Wrap, SectionHead } from '@/components/layout/Wrap';

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Wrap>
      <SectionHead title={title} description={description} />
      <p className="mt-10 text-ink-dim">Conteúdo desta página chega numa próxima etapa da migração.</p>
    </Wrap>
  );
}
