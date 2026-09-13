import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { AnnouncementsList } from '@/components/news/AnnouncementsList';

export default function NoticiasPage() {
  return (
    <Wrap>
      <SectionHead title="Notícias" description="Anúncios oficiais da organização, publicados direto do Discord." />
      <AnnouncementsList />
    </Wrap>
  );
}
