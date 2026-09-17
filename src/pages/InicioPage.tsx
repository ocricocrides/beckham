import { Link } from 'react-router-dom';
import { Wrap } from '@/components/layout/Wrap';
import { Btn } from '@/components/layout/Btn';
import { RotatingText } from '@/components/home/RotatingText';
import { CountUp } from '@/components/home/CountUp';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { ClipsSection } from '@/components/home/ClipsSection';
import { WallSection } from '@/components/home/WallSection';
import { useDiscordWidget } from '@/hooks/useDiscordWidget';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DISCORD_INVITE } from '@/lib/constants';

const KICKERS = ['BECKHAM · ORGANIZAÇÃO FIVEM', 'DESDE 2018 · SA-MP → FIVEM', 'LADO LESTE · SERVIDOR ATIVO'];

const TAGLINES = [
  'Uma família. Uma tropa. Uma organização.',
  'Oito anos depois, ainda de pé.',
  'Começou no SA-MP. Hoje domina o Lado Leste.',
  'Streamers, criadores e uma tropa inteira do mesmo lado.',
];

/** Terceiro número do hero: fica girando entre alguns destaques em vez de um texto parado. */
const HIGHLIGHTS = ['LADO LESTE', 'STREAMERS', 'RECRUTANDO'];
const HIGHLIGHT_LABELS = ['SERVIDOR ATIVO', 'TWITCH · YOUTUBE · TIKTOK', 'ABRA UM TICKET NO DISCORD'];

export default function InicioPage() {
  usePageMeta(
    'Início',
    'Começou como uma família no SA-MP em 2018 e virou organização. Membros, streamers, clipes e ranking da BECKHAM.',
  );
  const widget = useDiscordWidget();

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Hero ocupa a primeira tela; as seções novas ficam logo abaixo, entrando conforme rola. */}
      <section className="min-h-[calc(100dvh-80px)] flex flex-col justify-center py-7 pb-8">
        <Wrap>
          <div className="text-brand text-[0.85rem] font-bold tracking-[3px] mb-[18px] text-center">
            <RotatingText items={KICKERS} className="justify-items-center" />
          </div>

          <picture className="block mx-auto w-full max-w-[620px]">
            <source srcSet="/assets/logo.webp" type="image/webp" />
            <img
              src="/assets/logo.png"
              alt="BECKHAM"
              width={620}
              height={482}
              loading="eager"
              className="w-full max-[600px]:max-w-[88vw] h-auto block mx-auto animate-logo-sway [transform-origin:50%_60%]"
              style={{ filter: 'drop-shadow(0 0 28px rgba(255,22,51,0.35))' }}
            />
          </picture>

          <p className="max-w-[560px] mx-auto text-center [text-wrap:balance] mt-[18px] text-[1.15rem] text-ink-dim leading-[1.6]">
            <RotatingText items={TAGLINES} className="justify-items-center" />
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
            <Btn asChild variant="primary">
              <Link to="/streamers">Nossos streamers</Link>
            </Btn>
          </div>

          <div className="flex flex-wrap justify-center mt-8 border-t border-line">
            <div className="flex-1 basis-1/2 min-[701px]:basis-auto min-[701px]:px-10 pt-[22px] pb-4 min-[701px]:pb-0 border-b min-[701px]:border-b-0 border-line text-center">
              <CountUp value={2018} from={2010} className="block text-[2.1rem] leading-[2.4rem] font-bold text-brand font-display" />
              <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">FUNDAÇÃO</div>
            </div>
            <div className="flex-1 basis-1/2 min-[701px]:basis-auto min-[701px]:px-10 pt-[22px] pb-4 min-[701px]:pb-0 border-b min-[701px]:border-b-0 border-line text-center">
              <CountUp value={40} suffix="+" className="block text-[2.1rem] leading-[2.4rem] font-bold text-brand font-display" />
              <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">MEMBROS ATIVOS</div>
            </div>
            <div className="flex-1 basis-full min-[701px]:basis-auto min-[701px]:px-10 pt-[22px] pb-0 text-center min-w-[240px]">
              <div className="text-[1.4rem] leading-[2.4rem] tracking-wide font-bold text-brand font-display">
                <RotatingText items={HIGHLIGHTS} className="justify-items-center" />
              </div>
              <div className="text-[0.8rem] text-ink-dim tracking-wide mt-1">
                <RotatingText items={HIGHLIGHT_LABELS} className="justify-items-center" />
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      <Wrap>
        {/* Sem clipes (e sem ser ADM) o componente não renderiza nada e a seção vazia some. */}
        <section className="py-14 border-t border-line empty:hidden">
          <ClipsSection />
        </section>
        <section className="py-14 border-t border-line">
          <HomeDashboard />
        </section>
        <section className="py-14 border-t border-line">
          <WallSection />
        </section>
      </Wrap>
    </div>
  );
}
