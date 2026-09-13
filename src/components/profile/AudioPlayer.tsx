import { useEffect, useRef, useState } from 'react';

function labelFromUrl(url: string) {
  try {
    return decodeURIComponent(url.split('/').pop()!.split('?')[0]) || 'Música';
  } catch {
    return 'Música';
  }
}

export function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const label = labelFromUrl(url);
  const loopLabel = `${label}  •  ${label}  •  `;

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

  function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }

  return (
    <div className="mt-6 flex items-center gap-3 bg-panel-2 border border-line px-3.5 py-2.5 text-left">
      <button
        type="button"
        aria-label="Reproduzir/Pausar"
        onClick={toggle}
        className="flex-none w-[38px] h-[38px] rounded-full border border-line bg-brand/10 text-brand flex items-center justify-center hover:border-brand"
      >
        <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" hidden={playing}>
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" hidden={!playing}>
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      </button>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="inline-block whitespace-nowrap w-full overflow-hidden">
          <span className="inline-block text-ink font-semibold text-[0.85rem] animate-player-marquee">{loopLabel}</span>
        </div>
      </div>
      <div className="flex-none flex items-center gap-1.5 text-ink-dim">
        <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" className="flex-none">
          <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={onVolumeChange}
          className="w-16 accent-brand"
        />
      </div>
    </div>
  );
}
