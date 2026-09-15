import { DISCORD_INVITE } from '@/lib/constants';

export function Footer() {
  return (
    // No fim do documento, em fluxo normal: nao tem conteudo passando por baixo
    // (fim do vazamento) nem colisao com a barra de URL do Safari no iOS.
    <footer
      className="relative z-[1] border-t border-line px-[5vw] py-4 text-ink-dim text-[0.8rem] bg-void"
    >
      <div className="flex justify-center items-center gap-x-5 gap-y-1.5 flex-wrap text-center">
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
        <div className="max-[760px]:w-full max-[760px]:text-[0.72rem]">
          © 2026 BECKHAM — A comunidade é real. O que acontece no jogo é roleplay.
        </div>
      </div>
    </footer>
  );
}
