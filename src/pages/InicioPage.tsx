import { Wrap } from '@/components/layout/Wrap';
import { Btn } from '@/components/layout/Btn';
import { useDiscordWidget } from '@/hooks/useDiscordWidget';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DISCORD_INVITE } from '@/lib/constants';

export default function InicioPage() {
  usePageMeta(
    'Início',
    'Começou como uma família no SA-MP em 2018 e virou organização. Membros, história, fotos e ranking da BECKHAM.',
  );
  const widget = useDiscordWidget();

  return (
    <div className="relative flex-1 flex flex-col justify-center py-7 pb-8">
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

        {/* text-wrap:balance evita que a última palavra caia sozinha numa linha órfã. */}
        <p className="max-w-[520px] mx-auto text-center [text-wrap:balance] mt-[18px] text-[1.15rem] text-ink-dim leading-[1.6]">
          Uma família. Uma tropa. Uma organização. Oito anos depois, ainda de pé.
        </p>

        {/* O convite fixo sempre aparece — é o único canal de contato. A bolinha de "online" só
            entra quando o widget do Discord responde (precisa estar ligado nas configs do server). */}
        <div className="mt-6 flex items-center justify-center gap-3.5 flex-wrap text-ink-dim text-[0.9rem]">
          {widget && (
            <>
              <span
                className="w-[9px] h-[9px] rounded-full bg-[#3ddc84] inline-block"
                style={{ boxShadow: '0 0 6px #3ddc84' }}
              />
              <span>{widget.presenceCount} online</span>
            </>
          )}
          <Btn asChild variant="outline">
            <a href={widget?.inviteUrl || DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Entrar no Discord
            </a>
          </Btn>
        </div>

        <div className="flex flex-wrap mt-8 border-t border-line">
          <div className="flex-1 basis-1/2 min-[701px]:basis-auto pt-[22px] pr-6 pb-4 min-[701px]:pb-0 border-b min-[701px]:border-b-0 border-line">
            <div className="text-[2.1rem] leading-[2.4rem] font-bold text-brand font-display">2018</div>
            <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">FUNDAÇÃO</div>
          </div>
          <div className="flex-1 basis-1/2 min-[701px]:basis-auto pt-[22px] pr-6 pb-4 min-[701px]:pb-0 border-b min-[701px]:border-b-0 border-line">
            <div className="text-[2.1rem] leading-[2.4rem] font-bold text-brand font-display">40+</div>
            <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">MEMBROS ATIVOS</div>
          </div>
          <div className="flex-1 basis-1/2 min-[701px]:basis-auto pt-[22px] pr-0 pb-0">
            <div className="text-[1.4rem] leading-[2.4rem] tracking-wide font-bold text-brand font-display">LADO LESTE</div>
            <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">SERVIDOR ATIVO</div>
          </div>
        </div>

      </Wrap>
    </div>
  );
}
