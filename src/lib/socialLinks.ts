import type { SocialKind } from '@/components/profile/SocialIcon';

/** Domínios aceitos por rede. Discord aceita qualquer link discord.gg/discord.com (convite, não precisa ser perfil). */
const ALLOWED_DOMAINS: Record<SocialKind, string[]> = {
  instagram: ['instagram.com'],
  x: ['x.com', 'twitter.com'],
  youtube: ['youtube.com', 'youtu.be'],
  twitch: ['twitch.tv'],
  tiktok: ['tiktok.com'],
  discord: ['discord.com', 'discord.gg'],
};

const LABELS: Record<SocialKind, string> = {
  instagram: 'Instagram',
  x: 'X/Twitter',
  youtube: 'YouTube',
  twitch: 'Twitch',
  tiktok: 'TikTok',
  discord: 'Discord',
};

/** Retorna a mensagem de erro se o link não bater com o domínio da rede, ou null se estiver ok (campo vazio também é ok). */
export function getSocialLinkError(kind: SocialKind, value: string): string | null {
  const v = value.trim();
  if (!v) return null;

  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return 'Link inválido';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'Link inválido';

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const ok = ALLOWED_DOMAINS[kind].some((domain) => host === domain || host.endsWith(`.${domain}`));
  return ok ? null : `Use um link do ${LABELS[kind]}`;
}
