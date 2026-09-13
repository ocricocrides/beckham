import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { Btn } from '@/components/layout/Btn';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';

export function AnnouncementsList() {
  const { profile } = useAuth();
  const { announcements, loading, reload } = useAnnouncements();
  const confirm = useConfirm();
  const isAdmin = !!profile?.is_admin;
  const [createOpen, setCreateOpen] = useState(false);

  async function handleDelete(id: string) {
    if (!(await confirm('Excluir esse anúncio?'))) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else reload();
  }

  const createButton = isAdmin && (
    <div className="mt-8 flex justify-end">
      <Btn type="button" variant="primary" onClick={() => setCreateOpen(true)}>
        + Novo anúncio
      </Btn>
      <CreateAnnouncementModal open={createOpen} onOpenChange={setCreateOpen} onCreated={reload} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-[18px] pb-20">
        {createButton}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-[52px]" />
        ))}
      </div>
    );
  }

  if (!announcements?.length) {
    return (
      <div className="pb-20">
        {createButton}
        <p className="mt-8 text-ink-dim text-[0.85rem]">Nenhum anúncio publicado ainda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px] pb-20">
      {createButton}
      {announcements.map((a) => (
        <div key={a.id} className="relative bg-panel border border-line p-6">
          {isAdmin && (
            <button
              type="button"
              title="Excluir anúncio"
              onClick={() => handleDelete(a.id)}
              className="absolute top-5 right-5 z-[2] w-[26px] h-[26px] rounded-full bg-void/75 border border-line text-ink hover:border-brand hover:text-brand flex items-center justify-center"
            >
              <X size={14} />
            </button>
          )}
          <h4 className="text-ink text-[1.15rem] mb-1.5 pr-8">{a.title}</h4>
          <div className="text-brand text-[0.72rem] font-bold tracking-wide mb-3">
            {new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
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
