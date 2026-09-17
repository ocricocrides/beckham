import { AudioPlayer, YouTubeAudioPlayer } from './AudioPlayer';

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'episode', 'show', 'artist'];
const SPOTIFY_TALL_TYPES = ['album', 'playlist', 'show', 'artist'];

export function MusicEmbed({ url }: { url: string }) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace('www.', '');

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    let videoId = '';
    if (host === 'youtu.be') videoId = parsed.pathname.slice(1);
    else if (parsed.pathname.startsWith('/shorts/')) videoId = parsed.pathname.split('/')[2];
    else videoId = parsed.searchParams.get('v') || '';

    // Do YouTube só interessa o áudio: player escondido + os mesmos controles do .mp3.
    if (videoId) return <YouTubeAudioPlayer videoId={videoId} />;
  }

  if (host === 'open.spotify.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    const typeIndex = parts.findIndex((p) => SPOTIFY_TYPES.includes(p));
    if (typeIndex !== -1 && parts[typeIndex + 1]) {
      const type = parts[typeIndex];
      const id = parts[typeIndex + 1];
      const tall = SPOTIFY_TALL_TYPES.includes(type);
      return (
        <div className="mt-6 rounded-lg overflow-hidden">
          <iframe
            src={`https://open.spotify.com/embed/${type}/${id}`}
            title="Música"
            className={tall ? 'w-full h-[352px] block border-0' : 'w-full h-[152px] block border-0'}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </div>
      );
    }
  }

  return <AudioPlayer url={url} />;
}
