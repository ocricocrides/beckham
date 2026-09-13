import { useEffect, useRef } from 'react';
import { DISCORD_INVITE } from '@/lib/constants';

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty('--footer-h', `${el.offsetHeight}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="fixed left-0 right-0 bottom-0 z-50 border-t border-line px-[5vw] py-4 text-ink-dim text-[0.8rem] bg-gradient-to-t from-void/95 to-void/85 backdrop-blur-md"
    >
      <div className="flex justify-between items-center gap-x-5 gap-y-1.5 flex-wrap">
        <div className="logo flex items-center gap-2.5 text-[0.95rem]">
          <picture>
            <source srcSet="/assets/logo.webp" type="image/webp" />
            <img
              className="h-[26px] w-auto block animate-logo-sway [transform-origin:50%_60%]"
              src="/assets/logo.png"
              alt="BECKHAM"
              width={90}
              height={26}
              loading="eager"
            />
          </picture>
        </div>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold tracking-wide text-ink-dim hover:text-brand transition-colors"
        >
          Suporte e contato: Discord
        </a>
        <div className="max-[760px]:w-full max-[760px]:text-center max-[760px]:text-[0.72rem]">
          © 2026 — Organização fictícia para fins de roleplay em FiveM.
        </div>
      </div>
    </footer>
  );
}
