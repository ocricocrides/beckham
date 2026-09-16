import { useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField, FileInput, inputClass } from '@/components/layout/FormField';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { logDiscordAction } from '@/lib/discordLog';

async function uploadCrewPhoto(file: File) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('crew-photos').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('crew-photos').getPublicUrl(path);
  return data.publicUrl;
}

export function AddPhotoModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle('');
    setSubtitle('');
    setImageFile(null);
    setMsg('');
    setMsgKind('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile) return;
    setSaving(true);
    setMsgKind('');
    setMsg('Enviando...');
    try {
      const image_url = await uploadCrewPhoto(imageFile);
      const tituloFinal = title.trim();
      const { error } = await supabase.from('crew_photos').insert({
        title: tituloFinal,
        subtitle: subtitle.trim() || null,
        image_url,
      });
      if (error) throw error;
      onCreated();
      logDiscordAction('post_photo', tituloFinal, image_url);
      reset();
      onOpenChange(false);
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
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[480px] max-h-[88vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="min-h-0 flex-1 overflow-y-auto p-9">
          <h3 className="text-[1.4rem] mb-5 text-ink">Nova foto</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FormField label="Título" htmlFor="phTitle">
              <Input id="phTitle" required maxLength={80} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            <FormField label="Subtítulo (opcional)" htmlFor="phSubtitle">
              <Input id="phSubtitle" maxLength={80} className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </FormField>
            <FormField label="Imagem" htmlFor="phImage">
              <FileInput id="phImage" accept="image/*" inputRef={imageInputRef} fileName={imageFile?.name} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </FormField>

            <Btn type="submit" variant="primary" disabled={saving || !imageFile}>
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
