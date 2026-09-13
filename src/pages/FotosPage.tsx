import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export default function FotosPage() {
  return (
    <Wrap>
      <SectionHead title="Fotos" description="Registros da organização em eventos, reuniões e atividades oficiais." />
      <GalleryGrid />
    </Wrap>
  );
}
