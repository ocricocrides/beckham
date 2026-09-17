import { useEffect, useRef, useState } from 'react';
import { ScrollingTitle } from './ScrollingTitle';

function labelFromUrl(url: string) {
  try {
    const name = decodeURIComponent(url.split('/').pop()!.split('?')[0]).replace(/\.[a-z0-9]{2,4}$/i, '');
    return name || 'Música';
  } catch {
    return 'Música';
  }
}

/**
 * Player de música do perfil: play/pause, título deslizando (estilo Spotify) e volume. Usado
 * tanto pelo .mp3 direto quanto pelo YouTube (que toca num iframe escondido e é comandado por aqui).
 */
export function MusicControls({
  title,
  playing,
  volume,
  onToggle,
  onVolume,
}: {
  title: string;
  playing: boolean;
  volume: number;
  onToggle: () => void;
  onVolume: (v: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center gap-3 bg-panel-2 border border-line px-3.5 py-2.5 text-left">
      <button
        type="button"
        aria-label={playing ? 'Pausar música' : 'Tocar música'}
        onClick={onToggle}
        className="flex-none w-[38px] h-[38px] rounded-full border border-line bg-brand/10 text-brand flex items-center justify-center hover:border-brand"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <ScrollingTitle text={title} className="flex-1 min-w-0 text-ink font-semibold text-[0.85rem]" />
      <div className="flex-none flex items-center gap-1.5 text-ink-dim">
        <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" className="flex-none">
          <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          aria-label="Volume"
          onChange={(e) => onVolume(Number(e.target.value))}
          className="w-16 accent-brand"
        />
      </div>
    </div>
  );
}

export function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume / 100;
    audioRef.current = audio;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.play().catch(() => {
      /* autoplay blocked without prior interaction — manual play still works */
    });
    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function changeVolume(v: number) {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }

  return (
    <MusicControls
      title={labelFromUrl(url)}
      playing={playing}
      volume={volume}
      onToggle={toggle}
      onVolume={changeVolume}
    />
  );
}

/**
 * Música do YouTube só como áudio: o player oficial fica escondido (1px, invisível) e é
 * comandado pela API de postMessage do embed (enablejsapi=1). O estado de tocando/pausado
 * vem das mensagens que o próprio player manda de volta.
 */
export function YouTubeAudioPlayer({ videoId }: { videoId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [title, setTitle] = useState('Carregando música…');
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  function send(func: string, args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  }

  useEffect(() => {
    setPlaying(false);
    setTitle('Carregando música…');
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (data.event === 'onReady') send('setVolume', [volumeRef.current]);
      const videoTitle = (data.info as { videoData?: { title?: string } } | undefined)?.videoData?.title;
      if (data.event === 'infoDelivery' && videoTitle) setTitle(videoTitle);
      const state =
        data.event === 'onStateChange'
          ? (data.info as number)
          : data.event === 'infoDelivery'
            ? (data.info as { playerState?: number } | undefined)?.playerState
            : undefined;
      // 1 = tocando, 3 = carregando (conta como tocando pra não piscar), 0/2/5/-1 = parado.
      if (state === 1 || state === 3) setPlaying(true);
      else if (state !== undefined) setPlaying(false);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [videoId]);

  function handleLoad() {
    // Pede pro player começar a mandar os eventos de estado pra esta página.
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: videoId, channel: 'widget' }), '*');
    send('setVolume', [volumeRef.current]);
  }

  function toggle() {
    if (playing) {
      send('pauseVideo');
      setPlaying(false);
    } else {
      send('playVideo');
      setPlaying(true);
    }
  }

  function changeVolume(v: number) {
    setVolume(v);
    send('setVolume', [v]);
    if (v > 0) send('unMute');
  }

  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';

  return (
    <>
      <MusicControls title={title} playing={playing} volume={volume} onToggle={toggle} onVolume={changeVolume} />
      <iframe
        ref={iframeRef}
        key={videoId}
        onLoad={handleLoad}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&loop=1&playlist=${videoId}&controls=0&enablejsapi=1&origin=${origin}`}
        title="Música"
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        className="fixed -left-[9999px] top-0 w-px h-px opacity-0 pointer-events-none border-0"
      />
    </>
  );
}
