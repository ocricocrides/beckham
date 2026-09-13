import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const TIMELINE = [
  {
    year: '2018',
    title: 'Fundação',
    text: 'Bruno "Trovão" Beckham e Neco Beckham fundam a facção após competir juntos em campeonatos no FiveM.',
  },
  {
    year: '2020',
    title: 'Expansão',
    text: 'A facção cresce, conquista sede fixa e passa a ser reconhecida no servidor.',
  },
  {
    year: '2023',
    title: 'Volta ao Hype',
    text: 'A facção retorna ao servidor Hype pela segunda vez, decidida a focar 100% no crescimento.',
  },
  {
    year: '2026',
    title: 'Mudança para o Lado Leste',
    text: 'A BECKHAM se muda para o Lado Leste, onde está hoje.',
  },
];

export default function HistoriaPage() {
  useDocumentTitle('História');
  return (
    <Wrap>
      <SectionHead title="História" description="A trajetória da BECKHAM, desde o primeiro campeonato até virar o que ela é hoje." />

      <p className="mt-8 text-[1.3rem] leading-[1.7] text-ink max-w-[760px] border-l-[3px] border-brand pl-6">
        A BECKHAM começou em 2018, quando um grupo que já competia em campeonatos no FiveM resolveu virar uma
        facção fixa.
      </p>

      <div className="mt-10 max-w-[760px] text-ink-dim text-[1.05rem] leading-[1.8] [&_p]:mb-5 [&_strong]:text-ink">
        <p>
          O grupo vinha de campeonatos disputados no FiveM e resolveu montar a própria facção, com nome fixo, em
          vez de continuar como só mais uma equipe de campeonato. A ideia partiu dos dois donos,{' '}
          <strong>Bruno "Trovão" Beckham</strong> e <strong>Neco Beckham</strong>. De lá pra cá, a facção já foi
          chamada pra vários projetos novos nos servidores por onde passou.
        </p>
      </div>

      <div className="mt-[60px] pb-[90px]">
        {TIMELINE.map((item) => (
          <div key={item.year} className="grid grid-cols-[110px_1fr] gap-7 py-6 border-t border-line last:border-b">
            <div className="font-display font-bold text-brand text-[1.1rem]">{item.year}</div>
            <div>
              <h4 className="text-ink text-[1.1rem] mb-1.5">{item.title}</h4>
              <p className="text-ink-dim text-[0.95rem] leading-[1.6]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}
