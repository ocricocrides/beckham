import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, inputClass } from '@/components/layout/FormField';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type MsgKind = '' | 'error' | 'success';

async function uploadMedia(userId: string, file: File, kind: 'avatar' | 'banner') {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('profile-media').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('profile-media').getPublicUrl(path);
  return data.publicUrl;
}

export function ProfileEditorModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [music, setMusic] = useState('');
  const [instagram, setInstagram] = useState('');
  const [x, setX] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitch, setTwitch] = useState('');
  const [discord, setDiscord] = useState('');
  const [shareImage, setShareImage] = useState<'avatar' | 'banner'>('avatar');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<MsgKind>('');
  const [saving, setSaving] = useState(false);

  const [linkStatus, setLinkStatus] = useState<{ text: string; code?: string } | null>(null);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (!open || !profile) return;
    setDisplayName(profile.display_name || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setMusic(profile.music_url || '');
    setInstagram(profile.instagram_url || '');
    setX(profile.x_url || '');
    setYoutube(profile.youtube_url || '');
    setTwitch(profile.twitch_url || '');
    setDiscord(profile.discord_url || '');
    setShareImage((profile.share_image as 'avatar' | 'banner') || 'avatar');
    setAvatarFile(null);
    setAvatarPreview(null);
    setBannerFile(null);
    setBannerPreview(null);
    setMsg('');
    setMsgKind('');
    refreshDiscordLinkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profile?.id]);

  async function refreshDiscordLinkStatus() {
    if (!profile || !user) return;
    if (profile.discord_id) {
      setLinkStatus({ text: '✅ Sua conta está vinculada ao Discord.' });
      return;
    }
    const { data } = await supabase
      .from('discord_link_requests')
      .select('*')
      .eq('member_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      setLinkStatus({ text: 'Você ainda não vinculou sua conta ao Discord.' });
      return;
    }
    const expirado = new Date(data.expires_at) < new Date();
    if (data.status === 'pending_code' && !expirado) {
      setLinkStatus({ text: `Rode /vincular codigo:${data.code} no Discord — expira em 15 minutos.`, code: data.code });
    } else if (data.status === 'pending_approval') {
      setLinkStatus({ text: '⏳ Pedido enviado — aguardando aprovação da staff no Discord.' });
    } else if (data.status === 'rejected') {
      setLinkStatus({ text: '❌ Seu último pedido de vínculo foi rejeitado pela staff. Gere um novo código se quiser tentar de novo.' });
    } else {
      setLinkStatus({ text: expirado ? 'O código anterior expirou. Gere um novo.' : 'Você ainda não vinculou sua conta ao Discord.' });
    }
  }

  async function handleGenerateCode() {
    if (!user || generatingRef.current) return;
    generatingRef.current = true;
    setLinkStatus({ text: 'Gerando código...' });
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await supabase.from('discord_link_requests').insert({ member_id: user.id, code: codigo });
    generatingRef.current = false;
    if (error) {
      setLinkStatus({ text: 'Erro ao gerar código: ' + error.message });
      return;
    }
    await refreshDiscordLinkStatus();
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setMsgKind('');
    setMsg('Salvando...');
    try {
      const avatar_url = avatarFile ? await uploadMedia(user.id, avatarFile, 'avatar') : profile.avatar_url ?? null;
      const banner_url = bannerFile ? await uploadMedia(user.id, bannerFile, 'banner') : profile.banner_url ?? null;

      const payload = {
        id: user.id,
        username: profile.username,
        display_name: displayName.trim() || profile.username,
        location: location.trim(),
        bio: bio.trim(),
        music_url: music.trim(),
        instagram_url: instagram.trim(),
        x_url: x.trim(),
        youtube_url: youtube.trim(),
        twitch_url: twitch.trim(),
        discord_url: discord.trim(),
        share_image: shareImage,
        avatar_url,
        banner_url,
      };
      const { error } = await supabase.from('member_profiles').upsert(payload);
      if (error) throw error;
      setMsgKind('success');
      setMsg('Perfil salvo!');
      await refreshProfile();
    } catch (err) {
      setMsgKind('error');
      setMsg('Erro: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-line rounded-none clip-corner-panel p-9 max-w-[560px] max-h-[88vh] overflow-y-auto text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <h3 className="text-[1.4rem] mb-5 text-ink">Meu Perfil</h3>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label="Nome de exibição" htmlFor="pfDisplayName">
            <Input id="pfDisplayName" required maxLength={40} className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </FormField>
          <FormField label="Localização" htmlFor="pfLocation">
            <Input id="pfLocation" maxLength={40} placeholder="ex: Lado Leste" className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField label="Bio" htmlFor="pfBio">
            <Textarea id="pfBio" rows={3} maxLength={240} className={inputClass} value={bio} onChange={(e) => setBio(e.target.value)} />
          </FormField>

          <FormField label="Avatar (imagem)" htmlFor="pfAvatarFile">
            <Input id="pfAvatarFile" type="file" accept="image/*" className={inputClass} onChange={onAvatarChange} />
          </FormField>
          {avatarPreview && <img src={avatarPreview} alt="Prévia do avatar" className="w-24 h-24 object-cover border border-line -mt-2" />}

          <FormField label="Banner (imagem)" htmlFor="pfBannerFile">
            <Input id="pfBannerFile" type="file" accept="image/*" className={inputClass} onChange={onBannerChange} />
          </FormField>
          {bannerPreview && <img src={bannerPreview} alt="Prévia do banner" className="w-full h-20 object-cover border border-line -mt-2" />}

          <FormField label="Imagem ao compartilhar o link do perfil (Discord, WhatsApp etc.)" htmlFor="pfShareImage">
            <Select value={shareImage} onValueChange={(v) => setShareImage(v as 'avatar' | 'banner')}>
              <SelectTrigger id="pfShareImage" className={cn(inputClass, 'w-full')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-panel-2 border border-line text-ink rounded-none">
                <SelectItem value="avatar">Avatar</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Música de fundo (link do YouTube, Spotify ou .mp3 direto)" htmlFor="pfMusic">
            <Input
              id="pfMusic"
              type="url"
              placeholder="https://youtube.com/watch?v=... ou https://open.spotify.com/track/..."
              className={inputClass}
              value={music}
              onChange={(e) => setMusic(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3.5 max-[480px]:grid-cols-1">
            <FormField label="Instagram" htmlFor="pfInstagram">
              <Input id="pfInstagram" type="url" placeholder="https://instagram.com/..." className={inputClass} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </FormField>
            <FormField label="X / Twitter" htmlFor="pfX">
              <Input id="pfX" type="url" placeholder="https://x.com/..." className={inputClass} value={x} onChange={(e) => setX(e.target.value)} />
            </FormField>
            <FormField label="YouTube" htmlFor="pfYoutube">
              <Input id="pfYoutube" type="url" placeholder="https://youtube.com/..." className={inputClass} value={youtube} onChange={(e) => setYoutube(e.target.value)} />
            </FormField>
            <FormField label="Twitch" htmlFor="pfTwitch">
              <Input id="pfTwitch" type="url" placeholder="https://twitch.tv/..." className={inputClass} value={twitch} onChange={(e) => setTwitch(e.target.value)} />
            </FormField>
            <FormField label="Discord" htmlFor="pfDiscord">
              <Input id="pfDiscord" type="url" placeholder="https://discord.gg/..." className={inputClass} value={discord} onChange={(e) => setDiscord(e.target.value)} />
            </FormField>
          </div>

          <div className="mb-1">
            <h4 className="text-ink text-[1rem] tracking-wide mb-3">Vincular Discord</h4>
            <p className="text-ink-dim text-[0.85rem] mb-3">
              {linkStatus?.code ? (
                <>
                  Rode <code className="bg-panel-2 px-1.5 py-0.5 border border-line">/vincular codigo:{linkStatus.code}</code> no Discord — expira em 15 minutos.
                </>
              ) : (
                linkStatus?.text ?? 'Carregando...'
              )}
            </p>
            {!profile?.discord_id && (
              <Btn type="button" variant="outline" onClick={handleGenerateCode}>
                Gerar código de vinculação
              </Btn>
            )}
          </div>

          <Btn type="submit" variant="primary" disabled={saving}>
            Salvar perfil
          </Btn>
          <Btn type="button" variant="outline" onClick={handleLogout}>
            Sair da conta
          </Btn>
          <div className={cn('text-[0.85rem] min-h-[1.2em] text-ink-dim', msgKind === 'error' && 'text-brand', msgKind === 'success' && 'text-[#3ddc84]')}>
            {msg}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
