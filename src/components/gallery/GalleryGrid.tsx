import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/hooks/useGallery';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { PhotoLightbox } from './PhotoLightbox';
import type { CrewPhoto } from '@/hooks/useGallery';

export function GalleryGrid() {
  const { profile } = useAuth();
  const { photos, loading, reload } = useGallery();
  const confirm = useConfirm();
  const [active, setActive] = useState<CrewPhoto | null>(null);
  const isAdmin = !!profile?.is_admin;

  async function handleDelete(id: string) {
    if (!(await confirm('Excluir essa foto da galeria?'))) return;
    const { error } = await supabase.from('crew_photos').delete().eq('id', id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else reload();
  }

  if (loading) {
    return (
      <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px] pb-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3]" />
        ))}
      </div>
    );
  }

  if (!photos?.length) {
    return <p className="mt-8 text-ink-dim text-[0.85rem]">Nenhuma foto publicada ainda.</p>;
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px] pb-20">
        {photos.map((p) => (
          <div
            key={p.id}
            className="relative aspect-[4/3] overflow-hidden border border-line bg-[#0b0b0c] cursor-pointer"
            onClick={() => setActive(p)}
          >
            {isAdmin && (
              <button
                type="button"
                title="Excluir foto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p.id);
                }}
                className="absolute top-2 right-2 z-[2] w-[26px] h-[26px] rounded-full bg-void/75 border border-line text-ink hover:border-brand hover:text-brand flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
            <img src={p.image_url} alt={p.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover block" />
            <div className="absolute left-0 right-0 bottom-0 px-4 py-3.5 bg-gradient-to-t from-black/85 to-transparent text-[0.85rem] font-semibold text-ink">
              {p.title}
              {p.subtitle && (
                <span className="block text-[0.7rem] text-brand font-bold tracking-wide mt-0.5">{p.subtitle}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <PhotoLightbox photo={active} onOpenChange={(open) => !open && setActive(null)} />
    </>
  );
}
