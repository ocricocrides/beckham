import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function FotosPage() {
  useDocumentTitle('Fotos');
  return (
    <Wrap>
      <SectionHead title="Fotos" description="Fotos das lembranças que já vivemos e do que ainda está por vir." />
      <GalleryGrid />
    </Wrap>
  );
}
