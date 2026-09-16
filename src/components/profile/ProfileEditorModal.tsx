import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FileInput, inputClass } from '@/components/layout/FormField';
import { CornerFrame } from '@/components/layout/CornerFrame';
import { Btn } from '@/components/layout/Btn';
import { BiolinkCard } from '@/components/profile/BiolinkCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { MemberProfileWithRoles } from '@/lib/supabase';

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
  const [tiktok, setTiktok] = useState('');
  const [discord, setDiscord] = useState('');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerRemoved, setBannerRemoved] = useState(false);

  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<MsgKind>('');
  const [saving, setSaving] = useState(false);

  const [linkStatus, setLinkStatus] = useState<{ text: string; code?: string } | null>(null);
  const generatingRef = useRef(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
    setTiktok(profile.tiktok_url || '');
    setDiscord(profile.discord_url || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(false);
    setBannerFile(null);
    setBannerPreview(null);
    setBannerRemoved(false);
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
    if (file) setAvatarRemoved(false);
  }

  function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
    if (file) setBannerRemoved(false);
  }

  function handleRemoveAvatar() {
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
  }

  function handleRemoveBanner() {
    if (bannerInputRef.current) bannerInputRef.current.value = '';
    setBannerFile(null);
    setBannerPreview(null);
    setBannerRemoved(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setMsgKind('');
    setMsg('Salvando...');
    try {
      const avatar_url = avatarFile
        ? await uploadMedia(user.id, avatarFile, 'avatar')
        : avatarRemoved
          ? null
          : profile.avatar_url ?? null;
      const banner_url = bannerFile
        ? await uploadMedia(user.id, bannerFile, 'banner')
        : bannerRemoved
          ? null
          : profile.banner_url ?? null;

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
        tiktok_url: tiktok.trim(),
        discord_url: discord.trim(),
        avatar_url,
        banner_url,
      };
      const { error } = await supabase.from('member_profiles').upsert(payload);
      if (error) throw error;
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarRemoved(false);
      setBannerFile(null);
      setBannerPreview(null);
      setBannerRemoved(false);
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

  const previewProfile: MemberProfileWithRoles | null = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      roles: [],
      display_name: displayName.trim() || profile.username,
      location: location.trim() || null,
      bio: bio.trim() || null,
      music_url: music.trim() || null,
      instagram_url: instagram.trim() || null,
      x_url: x.trim() || null,
      youtube_url: youtube.trim() || null,
      twitch_url: twitch.trim() || null,
      tiktok_url: tiktok.trim() || null,
      discord_url: discord.trim() || null,
      avatar_url: avatarPreview || (avatarRemoved ? null : profile.avatar_url),
      banner_url: bannerPreview || (bannerRemoved ? null : profile.banner_url),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profile,
    displayName,
    location,
    bio,
    music,
    instagram,
    x,
    youtube,
    twitch,
    tiktok,
    discord,
    avatarPreview,
    avatarRemoved,
    bannerPreview,
    bannerRemoved,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[1040px] max-h-[88vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="min-h-0 flex-1 overflow-y-auto p-9">
        <h3 className="text-[1.4rem] mb-5 text-ink">Meu Perfil</h3>
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
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
            <FileInput id="pfAvatarFile" accept="image/*" inputRef={avatarInputRef} fileName={avatarFile?.name} onChange={onAvatarChange} />
          </FormField>
          {(avatarPreview || (!avatarRemoved && profile?.avatar_url)) && (
            <div className="flex items-center gap-3 -mt-2">
              <CornerFrame>
                <img
                  src={avatarPreview || profile?.avatar_url || ''}
                  alt="Prévia do avatar"
                  className="w-24 h-24 object-cover"
                />
              </CornerFrame>
              <Btn type="button" variant="outline" onClick={handleRemoveAvatar}>
                Remover avatar
              </Btn>
            </div>
          )}
          {avatarRemoved && <p className="text-ink-dim text-[0.8rem] -mt-2">Avatar padrão será usado ao salvar.</p>}

          <FormField label="Banner (imagem)" htmlFor="pfBannerFile">
            <FileInput id="pfBannerFile" accept="image/*" inputRef={bannerInputRef} fileName={bannerFile?.name} onChange={onBannerChange} />
          </FormField>
          {(bannerPreview || (!bannerRemoved && profile?.banner_url)) && (
            <div className="flex flex-col gap-2 -mt-2">
              <CornerFrame>
                <img
                  src={bannerPreview || profile?.banner_url || ''}
                  alt="Prévia do banner"
                  className="w-full h-20 object-cover"
                />
              </CornerFrame>
              <Btn type="button" variant="outline" onClick={handleRemoveBanner} className="self-start">
                Remover banner
              </Btn>
            </div>
          )}
          {bannerRemoved && <p className="text-ink-dim text-[0.8rem] -mt-2">Banner padrão será usado ao salvar.</p>}

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
            <FormField label="TikTok" htmlFor="pfTiktok">
              <Input id="pfTiktok" type="url" placeholder="https://tiktok.com/@..." className={inputClass} value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
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

        <div className="lg:sticky lg:top-0">
          <p className="text-ink-dim text-[0.75rem] tracking-wide uppercase mb-3">Pré-visualização</p>
          {previewProfile && <BiolinkCard profile={previewProfile} />}
        </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
