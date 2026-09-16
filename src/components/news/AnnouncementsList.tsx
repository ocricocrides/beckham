import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAnnouncements, useAnnouncementsTrash } from '@/hooks/useAnnouncements';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { logDiscordAction } from '@/lib/discordLog';
import { formatDate } from '@/lib/utils';
import { Btn } from '@/components/layout/Btn';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import type { Announcement } from '@/hooks/useAnnouncements';

/** "@fulano" de quem postou, ou null se o anúncio for de antes dessa informação existir. */
function quemPostou(a: Announcement) {
  return a.posted_by_display_name || a.posted_by_username || null;
}

export function AnnouncementsList() {
  const { isAdmin, profile } = useAuth();
  const canPost =
    isAdmin || !!profile?.can_post_announcements || !!profile?.roles.some((r) => r.can_post_announcements);
  const canDelete =
    isAdmin || !!profile?.can_delete_announcements || !!profile?.roles.some((r) => r.can_delete_announcements);

  const { announcements, loading, reload } = useAnnouncements();
  const confirm = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);

  async function handleDelete(a: Announcement) {
    if (!(await confirm('Excluir esse anúncio? Dá pra restaurar depois, na lixeira.'))) return;
    const { error } = await supabase
      .from('announcements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', a.id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else {
      reload();
      const quem = quemPostou(a);
      const subject = `${a.title} (postado${quem ? ` por @${quem}` : ''} em ${formatDate(a.created_at)})`;
      logDiscordAction('delete_announcement', subject, a.image_url);
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
        <Btn type="button" variant="primary" onClick={() => setCreateOpen(true)}>
          + Novo anúncio
        </Btn>
      )}
      <CreateAnnouncementModal open={createOpen} onOpenChange={setCreateOpen} onCreated={reload} />
      <AnnouncementsTrashModal open={trashOpen} onOpenChange={setTrashOpen} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-[18px] pb-20">
        {toolbar}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-[52px]" />
        ))}
      </div>
    );
  }

  if (!announcements?.length) {
    return (
      <div className="pb-20">
        {toolbar}
        <p className="mt-8 text-ink-dim text-[0.85rem]">Nenhum anúncio publicado ainda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px] pb-20">
      {toolbar}
      {announcements.map((a) => (
        <div key={a.id} className="relative bg-panel border border-line p-6">
          {canDelete && (
            <button
              type="button"
              title="Excluir anúncio"
              onClick={() => handleDelete(a)}
              className="absolute top-5 right-5 z-[2] w-[26px] h-[26px] rounded-full bg-void/75 border border-line text-ink hover:border-brand hover:text-brand flex items-center justify-center"
            >
              <X size={14} />
            </button>
          )}
          <h4 className="text-ink text-[1.15rem] mb-1.5 pr-8">{a.title}</h4>
          <div className="text-brand text-[0.72rem] font-bold tracking-wide mb-3">
            {new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {quemPostou(a) && <span className="text-ink-dim font-normal"> · postado por @{quemPostou(a)}</span>}
          </div>
          <p className="text-ink-dim text-[0.95rem] leading-[1.6] whitespace-pre-wrap">{a.body}</p>
          {a.image_url && (
            <img src={a.image_url} alt={a.title} loading="lazy" className="w-full max-h-[280px] object-cover mt-3.5 border border-line" />
          )}
        </div>
      ))}
    </div>
  );
}

function AnnouncementsTrashModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { announcements, loading, reload } = useAnnouncementsTrash();
  const confirm = useConfirm();

  async function handleRestore(a: Announcement) {
    if (!(await confirm('Restaurar esse anúncio? Ele volta a aparecer na lista.'))) return;
    const { error } = await supabase.from('announcements').update({ deleted_at: null }).eq('id', a.id);
    if (error) alert('Erro ao restaurar: ' + error.message);
    else {
      reload();
      logDiscordAction('restore_announcement', a.title, a.image_url);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[480px] max-h-[80vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="min-h-0 flex-1 overflow-y-auto p-7">
          <h3 className="text-[1.2rem] mb-5 text-ink">Lixeira de anúncios</h3>
          {loading && <p className="text-ink-dim text-[0.85rem]">Carregando…</p>}
          {!loading && !announcements?.length && <p className="text-ink-dim text-[0.85rem]">A lixeira está vazia.</p>}
          <div className="flex flex-col gap-2">
            {announcements?.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-panel-2 border border-line px-3 py-2.5">
                <span className="flex-1 min-w-0 truncate text-ink text-[0.85rem]">{a.title}</span>
                <button
                  type="button"
                  title="Restaurar"
                  onClick={() => handleRestore(a)}
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
