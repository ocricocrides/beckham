export type ClipSource = 'youtube' | 'twitch' | 'tiktok' | 'streamable';

export interface ParsedClip {
  source: ClipSource;
  /** URL pro <iframe>. A Twitch exige o domínio atual em "parent", por isso é montada na hora. */
  embedUrl: string;
  /** Miniatura pública, quando a plataforma dá uma sem API (só o YouTube). */
  thumbnail: string | null;
  /** Vídeo em pé (TikTok, Shorts): o player abre em 9:16 em vez de 16:9. */
  vertical: boolean;
}

export const CLIP_SOURCE_LABEL: Record<ClipSource, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  tiktok: 'TikTok',
  streamable: 'Streamable',
};

function hostOf(url: URL) {
  return url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
}

function twitchClip(slug: string, parent: string): ParsedClip {
  return {
    source: 'twitch',
    embedUrl: `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&parent=${parent}&autoplay=true`,
    thumbnail: null,
    vertical: false,
  };
}

/**
 * Entende os links que a ADM cola (YouTube, Shorts, clipe/VOD da Twitch, TikTok, Streamable)
 * e devolve como tocar ele embutido. Retorna null se o link não for de nenhuma dessas.
 */
export function parseClipUrl(raw: string): ParsedClip | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;

  const host = hostOf(url);
  const parts = url.pathname.split('/').filter(Boolean);
  const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  if (host === 'youtube.com' || host === 'youtu.be') {
    let id: string | null = null;
    let vertical = false;
    if (host === 'youtu.be') id = parts[0] ?? null;
    else if (parts[0] === 'watch') id = url.searchParams.get('v');
    else if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') {
      id = parts[1] ?? null;
      vertical = parts[0] === 'shorts';
    }
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    return {
      source: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      vertical,
    };
  }

  if (host === 'clips.twitch.tv' && parts[0]) return twitchClip(parts[0], parent);
  if (host === 'twitch.tv') {
    if (parts[1] === 'clip' && parts[2]) return twitchClip(parts[2], parent);
    if (parts[0] === 'videos' && /^\d+$/.test(parts[1] ?? '')) {
      return {
        source: 'twitch',
        embedUrl: `https://player.twitch.tv/?video=${parts[1]}&parent=${parent}&autoplay=true`,
        thumbnail: null,
        vertical: false,
      };
    }
    return null;
  }

  if (host === 'tiktok.com') {
    const i = parts.indexOf('video');
    const id = i >= 0 ? parts[i + 1] : null;
    if (!id || !/^\d+$/.test(id)) return null;
    return { source: 'tiktok', embedUrl: `https://www.tiktok.com/embed/v2/${id}`, thumbnail: null, vertical: true };
  }

  if (host === 'streamable.com' && parts[0]) {
    const id = parts[0] === 'e' ? parts[1] : parts[0];
    if (!id || !/^\w+$/.test(id)) return null;
    return {
      source: 'streamable',
      embedUrl: `https://streamable.com/e/${id}?autoplay=1`,
      thumbnail: null,
      vertical: false,
    };
  }

  return null;
}
