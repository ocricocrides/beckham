import { Wrap } from '@/components/layout/Wrap';
import { Btn } from '@/components/layout/Btn';
import { useDiscordWidget } from '@/hooks/useDiscordWidget';

export default function InicioPage() {
  const widget = useDiscordWidget();

  return (
    <div
      className="relative flex flex-col justify-center py-7 pb-8"
      style={{ minHeight: 'calc(100vh - 78px - var(--footer-h, 90px))' }}
    >
      <Wrap>
        <div className="text-brand text-[0.85rem] font-bold tracking-[3px] mb-[18px]">BECKHAM — ORGANIZAÇÃO FIVEM</div>

        <picture>
          <source srcSet="/assets/logo.webp" type="image/webp" />
          <img
            src="/assets/logo.png"
            alt="BECKHAM"
            width={620}
            height={482}
            loading="eager"
            className="w-full max-w-[620px] max-[600px]:max-w-[88vw] h-auto block -ml-1.5 animate-logo-sway [transform-origin:50%_60%]"
            style={{ filter: 'drop-shadow(0 0 28px rgba(255,22,51,0.35))' }}
          />
        </picture>

        <p className="max-w-[520px] mt-[18px] text-[1.15rem] text-ink-dim leading-[1.6]">
          Começou nos campeonatos do FiveM em 2018. Hoje tá no Lado Leste.
        </p>

        <div className="flex flex-wrap mt-8 border-t border-line">
          <div className="flex-1 basis-1/2 min-[701px]:basis-auto pt-[22px] pr-6 pb-4 min-[701px]:pb-0 border-b min-[701px]:border-b-0 border-line">
            <div className="text-[2.1rem] leading-[2.4rem] font-bold text-brand font-display">2018</div>
            <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">FUNDAÇÃO</div>
          </div>
          <div className="flex-1 basis-1/2 min-[701px]:basis-auto pt-[22px] pr-6 pb-4 min-[701px]:pb-0 border-b min-[701px]:border-b-0 border-line">
            <div className="text-[2.1rem] leading-[2.4rem] font-bold text-brand font-display">12</div>
            <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">MEMBROS ATIVOS</div>
          </div>
          <div className="flex-1 basis-1/2 min-[701px]:basis-auto pt-[22px] pr-0 pb-0">
            <div className="text-[1.4rem] leading-[2.4rem] tracking-wide font-bold text-brand font-display">LADO LESTE</div>
            <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">SERVIDOR ATIVO</div>
          </div>
        </div>

        {widget && (
          <div className="mt-8 flex items-center gap-3.5 flex-wrap text-ink-dim text-[0.9rem]">
            <span
              className="w-[9px] h-[9px] rounded-full bg-[#3ddc84] inline-block"
              style={{ boxShadow: '0 0 6px #3ddc84' }}
            />
            <span>{widget.presenceCount} online</span>
            {widget.inviteUrl && (
              <Btn asChild variant="outline">
                <a href={widget.inviteUrl} target="_blank" rel="noopener noreferrer">
                  Entrar no Discord
                </a>
              </Btn>
            )}
          </div>
        )}
      </Wrap>
    </div>
  );
}
