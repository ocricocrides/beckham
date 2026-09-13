import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function FotosPage() {
  useDocumentTitle('Fotos');
  return (
    <Wrap>
      <SectionHead title="Fotos" description="Registros da organização em eventos, reuniões e atividades oficiais." />
      <GalleryGrid />
    </Wrap>
  );
}
