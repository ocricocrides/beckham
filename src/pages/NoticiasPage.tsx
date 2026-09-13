import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { AnnouncementsList } from '@/components/news/AnnouncementsList';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NoticiasPage() {
  usePageMeta('Notícias', 'Comunicados e avisos oficiais da BECKHAM.');
  return (
    <Wrap>
      <SectionHead title="Notícias" description="Anúncios oficiais da organização, publicados direto do Discord." />
      <AnnouncementsList />
    </Wrap>
  );
}
