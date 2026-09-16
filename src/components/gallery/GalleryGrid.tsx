import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGallery, useGalleryTrash } from '@/hooks/useGallery';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { logDiscordAction } from '@/lib/discordLog';
import { formatDate } from '@/lib/utils';
import { Btn } from '@/components/layout/Btn';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AddPhotoModal } from './AddPhotoModal';
import { PhotoLightbox } from './PhotoLightbox';
import type { CrewPhoto } from '@/hooks/useGallery';

/** "@fulano" de quem postou, ou null se a foto for de antes dessa informação existir. */
function quemPostou(p: CrewPhoto) {
  return p.posted_by_display_name || p.posted_by_username || null;
}

/** Pra mandar no log do Discord: marca (@menção real) quem postou, se a conta tiver Discord vinculado. */
function quemPostouParaDiscord(p: CrewPhoto) {
  if (p.posted_by_discord_id) return `<@${p.posted_by_discord_id}>`;
  const quem = quemPostou(p);
  return quem ? `@${quem}` : null;
}

export function GalleryGrid() {
  const { isAdmin, profile } = useAuth();
  const canPost = isAdmin || !!profile?.can_post_photos || !!profile?.roles.some((r) => r.can_post_photos);
  const canDelete = isAdmin || !!profile?.can_delete_photos || !!profile?.roles.some((r) => r.can_delete_photos);

  const { photos, loading, reload } = useGallery();
  const confirm = useConfirm();
  const [active, setActive] = useState<CrewPhoto | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);

  async function handleDelete(p: CrewPhoto) {
    if (!(await confirm('Excluir essa foto da galeria? Dá pra restaurar depois, na lixeira.'))) return;
    const { error } = await supabase
      .from('crew_photos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', p.id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else {
      reload();
      const quem = quemPostouParaDiscord(p);
      const subject = `${p.title} (postada${quem ? ` por ${quem}` : ''} em ${formatDate(p.created_at)})`;
      logDiscordAction('delete_photo', subject, p.image_url);
    }
  }

  const toolbar = (canPost || canDelete) && (
    <div className="mt-8 flex justify-end gap-2.5">
      {canDelete && (
        <Btn type="button" variant="outline" onClick={() => setTrashOpen(true)}>
          Lixeira
        </Btn>
      )}
      {canPost && (
        <Btn type="button" variant="primary" onClick={() => setAddOpen(true)}>
          + Adicionar foto
        </Btn>
      )}
      <AddPhotoModal open={addOpen} onOpenChange={setAddOpen} onCreated={reload} />
      <GalleryTrashModal open={trashOpen} onOpenChange={setTrashOpen} />
    </div>
  );

  if (loading) {
    return (
      <div className="pb-20">
        {toolbar}
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (!photos?.length) {
    return (
      <div className="pb-20">
        {toolbar}
        <p className="mt-8 text-ink-dim text-[0.85rem]">Nenhuma foto publicada ainda.</p>
      </div>
    );
  }

  return (
    <>
      {toolbar}
      <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5 pb-20">
        {photos.map((p) => (
          <div
            key={p.id}
            className="group/tile relative aspect-square overflow-hidden bg-[#0b0b0c] cursor-pointer"
            onClick={() => setActive(p)}
          >
            {canDelete && (
              <button
                type="button"
                title="Excluir foto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p);
                }}
                className="absolute top-1.5 right-1.5 z-[2] w-[22px] h-[22px] rounded-full bg-void/75 border border-line text-ink hover:border-brand hover:text-brand flex items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
            <img src={p.image_url} alt={p.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover block" />
            <div className="absolute left-0 right-0 bottom-0 px-2.5 py-2 bg-gradient-to-t from-black/85 to-transparent text-[0.72rem] font-semibold text-ink opacity-0 group-hover/tile:opacity-100 transition-opacity">
              {p.title}
              {p.subtitle && (
                <span className="block text-[0.65rem] text-brand font-bold tracking-wide mt-0.5">{p.subtitle}</span>
              )}
              <span className="block text-[0.6rem] font-normal text-ink-dim mt-0.5">
                {quemPostou(p) ? `postado por @${quemPostou(p)} · ` : ''}
                {formatDate(p.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <PhotoLightbox photo={active} onOpenChange={(open) => !open && setActive(null)} />
    </>
  );
}

function GalleryTrashModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { photos, loading, reload } = useGalleryTrash();
  const confirm = useConfirm();

  async function handleRestore(p: CrewPhoto) {
    if (!(await confirm('Restaurar essa foto? Ela volta a aparecer na galeria.'))) return;
    const { error } = await supabase.from('crew_photos').update({ deleted_at: null }).eq('id', p.id);
    if (error) alert('Erro ao restaurar: ' + error.message);
    else {
      reload();
      logDiscordAction('restore_photo', p.title, p.image_url);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[480px] max-h-[80vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="min-h-0 flex-1 overflow-y-auto p-7">
          <h3 className="text-[1.2rem] mb-5 text-ink">Lixeira de fotos</h3>
          {loading && <p className="text-ink-dim text-[0.85rem]">Carregando…</p>}
          {!loading && !photos?.length && <p className="text-ink-dim text-[0.85rem]">A lixeira está vazia.</p>}
          <div className="flex flex-col gap-2">
            {photos?.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-panel-2 border border-line px-3 py-2.5">
                <img src={p.image_url} alt={p.title} className="w-12 h-12 object-cover shrink-0" />
                <span className="flex-1 min-w-0 truncate text-ink text-[0.85rem]">{p.title}</span>
                <button
                  type="button"
                  title="Restaurar"
                  onClick={() => handleRestore(p)}
                  className="text-ink-dim hover:text-brand shrink-0"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
