import { useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FileInput, inputClass } from '@/components/layout/FormField';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { logDiscordAction } from '@/lib/discordLog';

async function uploadAnnouncementImage(file: File) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('announcement-media').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('announcement-media').getPublicUrl(path);
  return data.publicUrl;
}

export function CreateAnnouncementModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sendToDiscord, setSendToDiscord] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle('');
    setBody('');
    setImageFile(null);
    setSendToDiscord(false);
    setChannelId('');
    setMsg('');
    setMsgKind('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsgKind('');
    setMsg('Publicando...');
    try {
      const image_url = imageFile ? await uploadAnnouncementImage(imageFile) : null;
      const { error } = await supabase.from('announcements').insert({
        title: title.trim(),
        body: body.trim(),
        image_url,
      });
      if (error) throw error;
      logDiscordAction('post_announcement', title.trim(), image_url);

      let discordWarning = '';
      if (sendToDiscord) {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        const r = await fetch('/api/post-discord-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ channelId: channelId.trim(), title: title.trim(), body: body.trim(), imageUrl: image_url }),
        });
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          discordWarning = ` (anúncio salvo, mas não foi possível enviar ao Discord: ${data.error || 'erro desconhecido'})`;
        }
      }

      setMsgKind(discordWarning ? 'error' : 'success');
      setMsg(discordWarning ? `Anúncio publicado!${discordWarning}` : 'Anúncio publicado!');
      onCreated();
      if (!discordWarning) {
        reset();
        onOpenChange(false);
      }
    } catch (err) {
      setMsgKind('error');
      setMsg('Erro: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[560px] max-h-[88vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="min-h-0 flex-1 overflow-y-auto p-9">
          <h3 className="text-[1.4rem] mb-5 text-ink">Novo anúncio</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FormField label="Título" htmlFor="anTitle">
              <Input id="anTitle" required maxLength={120} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            <FormField label="Texto" htmlFor="anBody">
              <Textarea id="anBody" required rows={6} maxLength={4000} className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} />
            </FormField>
            <FormField label="Imagem (opcional)" htmlFor="anImage">
              <FileInput id="anImage" accept="image/*" inputRef={imageInputRef} fileName={imageFile?.name} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </FormField>

            <label className="flex items-center gap-2 text-[0.85rem] text-ink-dim">
              <input type="checkbox" checked={sendToDiscord} onChange={(e) => setSendToDiscord(e.target.checked)} />
              Enviar também no Discord
            </label>
            {sendToDiscord && (
              <FormField label="ID do canal do Discord" htmlFor="anChannelId">
                <Input
                  id="anChannelId"
                  required
                  inputMode="numeric"
                  pattern="\d+"
                  placeholder="ex: 1065057205201678436"
                  className={inputClass}
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
              </FormField>
            )}

            <Btn type="submit" variant="primary" disabled={saving}>
              Publicar
            </Btn>
            <div className={cn('text-[0.85rem] min-h-[1.2em] text-ink-dim', msgKind === 'error' && 'text-brand', msgKind === 'success' && 'text-[#3ddc84]')}>
              {msg}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
