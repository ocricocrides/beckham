import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function FotosPage() {
  usePageMeta('Fotos', 'Fotos das lembranças que já vivemos e do que ainda está por vir na BECKHAM.');
  return (
    <Wrap>
      <SectionHead title="Fotos" description="Fotos das lembranças que já vivemos e do que ainda está por vir." />
      <GalleryGrid />
    </Wrap>
  );
}
