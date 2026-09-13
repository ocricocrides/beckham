import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { AnnouncementsList } from '@/components/news/AnnouncementsList';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NoticiasPage() {
  useDocumentTitle('Notícias');
  return (
    <Wrap>
      <SectionHead title="Notícias" description="Anúncios oficiais da organização, publicados direto do Discord." />
      <AnnouncementsList />
    </Wrap>
  );
}
