import type { ReactNode } from 'react';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { usePageMeta } from '@/hooks/usePageMeta';

type Chapter = {
  year?: string;
  title: string;
  /** Frase solta, em destaque, antes dos parágrafos. */
  lead?: ReactNode;
  paragraphs: ReactNode[];
  /** Lista curta em coluna (usada só em "Mais do que uma organização"). */
  list?: string[];
  /** Frase solta, em destaque, depois dos parágrafos. */
  outro?: ReactNode;
  memorial?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    year: '2018',
    title: 'O início de uma história que ninguém imaginava onde chegaria',
    lead: 'Tudo começou em 2018.',
    paragraphs: [
      <>
        Antes de existir uma organização, uma tropa ou mesmo a dimensão que a Beckham alcançaria anos depois,
        existia apenas uma família dentro de um servidor de <strong>GTA San Andreas Multiplayer (SA-MP)</strong>,
        com temática do Rio de Janeiro.
      </>,
      <>
        Foi ali que <strong>Neco</strong> e <strong>Trovão</strong> deram os primeiros passos para construir aquilo
        que, anos mais tarde, se tornaria muito maior do que eles poderiam imaginar.
      </>,
      <>Naquela época, o GTA RP começava a ganhar força e um novo universo surgia diante deles.</>,
    ],
  },
  {
    year: '2019',
    title: 'A descoberta de um novo universo',
    paragraphs: [
      <>
        Por volta de 2019, <strong>Neco</strong>, <strong>Trovão</strong> e <strong>Killer</strong> decidiram
        explorar o universo do FiveM. O que começou como uma tentativa de conhecer novas cidades rapidamente se
        transformou em uma jornada.
      </>,
      <>
        Eles passaram por diferentes cidades, conheceram novas pessoas, fizeram amizades e viveram diferentes
        experiências dentro do RP.
      </>,
      <>
        Aquela simples “família” começou a crescer. E, pouco a pouco, a família se transformou em uma tropa.
        Depois, em uma organização. O nome Beckham começava a ganhar identidade.
      </>,
    ],
  },
  {
    title: 'A construção do nome',
    paragraphs: [
      <>
        A Beckham passou por diferentes fases. Esteve presente em cidades de RP, participou dos primeiros
        movimentos de servidores <strong>Academy</strong> e começou a se aventurar também no cenário competitivo.
      </>,
      <>
        Vieram campeonatos, disputas e novas oportunidades. Em alguns momentos, a Beckham entrou com suas próprias
        equipes. Em outros, jogadores que carregavam o nome Beckham também fizeram parte de lines de organizações
        que atuavam em cidades de grandes streamers e projetos de organizações de conteúdo.
      </>,
    ],
    outro: (
      <>
        O objetivo nunca foi apenas estar em uma cidade.
        <br />
        Era fazer o nome ser reconhecido.
      </>
    ),
  },
  {
    year: '2020 — 2022',
    title: 'A ascensão',
    paragraphs: [
      <>
        Entre 2020 e 2022 aconteceu um dos períodos mais importantes da história da Beckham. Foi nesse momento que
        a organização começou a alcançar uma proporção que, anos antes, parecia impossível.
      </>,
      <>
        A Beckham conseguiu migrar para o <strong>Cidade Alta Valley</strong>, assumindo a responsabilidade pelo
        HPI. Pouco depois, veio uma nova etapa: <strong>Hype</strong>. E com ela começaria uma das jornadas mais
        longas e marcantes da organização.
      </>,
      <>
        Foram <strong>três seasons</strong>. Três temporadas de altos e baixos, momentos difíceis, conquistas e,
        principalmente, guerras.
      </>,
      <>
        A Beckham precisou lutar pelo espaço que queria conquistar. E lutou. Guerra após guerra, a organização
        construiu seu caminho até finalmente conquistar aquilo que representava muito mais do que apenas um
        território: <strong>sua própria favela</strong>.
      </>,
    ],
    outro: 'A cada vitória, o nome Beckham ficava mais forte.',
  },
  {
    title: 'Mais do que uma organização',
    paragraphs: [
      <>
        Com o passar dos anos, a Beckham deixou de existir apenas dentro de uma cidade. O nome começou a aparecer
        em diferentes lugares.
      </>,
    ],
    list: ['GTA RP brasileiro', 'GTA RP português', 'Servidores de GTA no Xbox', 'E também em outros jogos'],
    outro: (
      <>
        A Beckham havia se transformado em algo maior do que um grupo dentro de um servidor. Era uma comunidade —
        um nome que diferentes pessoas carregavam em diferentes jogos e diferentes plataformas.
      </>
    ),
  },
  {
    title: 'O tempo passou',
    paragraphs: [
      <>
        Talvez uma das maiores conquistas da Beckham não possa ser medida em guerras vencidas, territórios
        conquistados ou campeonatos. Pode ser medida pelo tempo.
      </>,
      <>
        Ao longo desses anos, vimos meninos e meninas chegarem. E vimos essas mesmas pessoas crescerem. Alguns se
        tornaram homens. Outras se tornaram mulheres.
      </>,
      <>
        Pessoas que chegaram apenas para jogar acabaram criando amizades que ultrapassaram o próprio jogo. Vimos
        casais se formarem. Vimos famílias serem construídas. E vimos crianças incríveis chegarem ao mundo.
      </>,
      <>
        O que um dia começou como uma simples família dentro de um servidor acabou fazendo parte da vida de
        centenas de pessoas. E talvez esse seja o maior legado da Beckham.
      </>,
    ],
  },
  {
    year: '25 de dezembro de 2025',
    title: 'Em memória',
    memorial: true,
    paragraphs: [
      <>Mas nem toda lembrança é feita apenas de momentos felizes.</>,
      <>
        No dia 25 de dezembro de 2025, a Beckham perdeu um grande amigo. Alguém que esteve presente durante uma
        parte importante dessa caminhada.
      </>,
      <>
        A perda deixou uma marca na organização. E, desde então, seu nome passou a fazer parte da história da
        Beckham de uma maneira que o tempo jamais poderá apagar.
      </>,
      <>
        Como forma de homenagem, seu nome será carregado junto da organização e permanecerá presente na própria
        favela da Beckham.
      </>,
    ],
    outro:
      'Porque algumas pessoas deixam de estar presentes fisicamente, mas nunca deixam de fazer parte da história.',
  },
  {
    year: '2026',
    title: 'Uma nova geração',
    paragraphs: [
      <>
        Oito anos se passaram. Durante esse período, muitas tropas surgiram. Muitas cresceram. Muitas chegaram ao
        topo. E muitas também desapareceram.
      </>,
    ],
    lead: 'A Beckham permaneceu.',
    outro: (
      <>
        E, enquanto novos nomes passam a carregar o brasão Beckham, aqueles que estiveram presentes desde o início
        continuam fazendo parte daquilo que tornou tudo isso possível.
      </>
    ),
  },
  {
    title: 'O legado',
    paragraphs: [
      <>
        Quando Neco e Trovão criaram aquela pequena família em 2018, ninguém poderia imaginar onde aquilo chegaria.
        Não havia como prever os servidores. As guerras. As vitórias. Os campeonatos. As amizades. As histórias. As
        famílias que seriam construídas. As pessoas que cresceriam juntas.
      </>,
      <>Muito menos imaginar que, oito anos depois, o nome ainda estaria de pé.</>,
      <>
        A Beckham não é apenas uma organização. É a soma de todas as pessoas que passaram por ela. De quem esteve
        desde o primeiro dia. De quem chegou no meio do caminho. De quem precisou partir. De quem ainda permanece.
        E daqueles que hoje começam uma nova geração.
      </>,
    ],
  },
];

/** Parágrafos do capítulo "2026" que vêm depois do lead "A Beckham permaneceu." */
const NOVA_GERACAO_EXTRA = [
  'Dos integrantes da antiga geração, poucos continuam ativos e presentes. Mas isso não significa o fim de uma era. Significa o começo de outra.',
  'Hoje, uma nova geração começa a se erguer. Novos jogadores chegam. Novas histórias começam. Novas amizades são criadas.',
];

export default function HistoriaPage() {
  usePageMeta(
    'História',
    'De uma família no SA-MP em 2018 até a favela conquistada no Hype: oito anos da BECKHAM, contados por quem viveu.',
  );

  return (
    <Wrap>
      <SectionHead
        title="História"
        description="Oito anos de BECKHAM — de uma família dentro de um servidor até um nome carregado em vários jogos."
      />

      <p className="mt-10 text-[clamp(1.2rem,2.6vw,1.5rem)] leading-[1.6] text-ink max-w-[760px] border-l-[3px] border-brand pl-6">
        Antes de existir uma organização, existia apenas uma família dentro de um servidor. Oito anos depois, a
        BECKHAM continua de pé.
      </p>

      <div className="mt-16 pb-[90px] max-w-[820px]">
        {CHAPTERS.map((chapter, i) => (
          <section
            key={chapter.title}
            className={
              chapter.memorial
                ? 'relative my-14 border border-line bg-panel/60 px-6 py-9 max-[700px]:px-5'
                : 'border-t border-line pt-12 pb-4 first:border-t-0 first:pt-0'
            }
          >
            {chapter.memorial && (
              <>
                <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-brand/50 transform-gpu" />
                <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-brand/50 transform-gpu" />
              </>
            )}

            {chapter.year && (
              <div className="font-display font-bold text-brand text-[0.85rem] tracking-[3px] uppercase mb-3">
                {chapter.year}
              </div>
            )}

            <h3
              className={
                chapter.memorial
                  ? 'font-display text-ink text-[1.15rem] tracking-wide mb-6'
                  : 'text-ink text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.3] mb-6'
              }
            >
              {chapter.title}
            </h3>

            {chapter.lead && <p className="text-ink text-[1.25rem] leading-[1.5] font-bold mb-6">{chapter.lead}</p>}

            <div className="text-ink-dim text-[1.05rem] leading-[1.8] [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:text-ink [&_strong]:font-bold">
              {chapter.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {chapter.year === '2026' && NOVA_GERACAO_EXTRA.map((p) => <p key={p}>{p}</p>)}
            </div>

            {chapter.list && (
              <ul className="mt-6 flex flex-col gap-2.5 text-ink text-[1.05rem]">
                {chapter.list.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-brand inline-block shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {chapter.outro && (
              <p
                className={
                  chapter.memorial
                    ? 'mt-7 pt-6 border-t border-line text-ink text-[1.05rem] leading-[1.7] italic'
                    : 'mt-7 text-ink text-[1.15rem] leading-[1.6] font-bold'
                }
              >
                {chapter.outro}
              </p>
            )}

            {chapter.memorial && (
              <div className="mt-5 font-display font-bold text-brand text-[0.9rem] tracking-[2px] uppercase">
                #EternoJordan
              </div>
            )}

            {i === CHAPTERS.length - 1 && (
              <div className="mt-10 border-t border-line pt-8 text-ink-dim text-[1.05rem] leading-[1.8]">
                <p className="mb-6">2018 foi apenas o começo. Oito anos depois, a Beckham continua ativa.</p>
                <p className="text-ink text-[1.25rem] leading-[1.5] font-bold mb-6">
                  E existe apenas uma pergunta para o futuro: será que chegaremos aos 10 anos?
                </p>
                <p>Se depender daqueles que ainda carregam esse nome… a história ainda está longe de acabar.</p>
              </div>
            )}
          </section>
        ))}

        <div className="mt-20 border-t border-line pt-14 text-center">
          <div className="font-display font-black text-ink text-[clamp(2rem,7vw,3.5rem)] tracking-[6px] leading-none">
            BECKHAM
          </div>
          <div className="font-display font-bold text-brand text-[clamp(1.1rem,3vw,1.5rem)] tracking-[4px] mt-4">
            2018 — ∞
          </div>
          <p className="text-ink-dim text-[1.05rem] mt-6">Uma família. Uma tropa. Uma organização. Um legado.</p>
        </div>
      </div>
    </Wrap>
  );
}
