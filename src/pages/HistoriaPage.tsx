import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const TIMELINE = [
  {
    year: '2018',
    title: 'Fundação',
    text: 'Neco Beckham reúne o primeiro núcleo de membros e estabelece a base da organização.',
  },
  {
    year: '2020',
    title: 'Expansão',
    text: 'A organização cresce, conquista uma sede fixa e passa a ser reconhecida no servidor.',
  },
  {
    year: '2023',
    title: 'Mudança para o Lado Leste',
    text: 'A BECKHAM se estabelece no servidor Lado Leste, onde constrói sua sede atual.',
  },
  {
    year: '2026',
    title: 'Hoje',
    text: 'A BECKHAM segue ativa no Lado Leste, expandindo seu quadro de membros com critério e mantendo os valores estabelecidos pelo fundador.',
  },
];

export default function HistoriaPage() {
  useDocumentTitle('História');
  return (
    <Wrap>
      <SectionHead title="História" description="De onde a BECKHAM veio e o que ela representa hoje." />

      <p className="mt-8 text-[1.3rem] leading-[1.7] text-ink max-w-[760px] border-l-[3px] border-brand pl-6">
        A BECKHAM nasceu de uma ideia simples: nenhum membro deveria enfrentar desafios sozinho.
      </p>

      <div className="mt-10 max-w-[760px] text-ink-dim text-[1.05rem] leading-[1.8] [&_p]:mb-5 [&_strong]:text-ink">
        <p>
          No fim de 2018, um pequeno grupo de colaboradores que já atuava em conjunto em diversas atividades decidiu
          formalizar essa parceria. <strong>Neco Beckham</strong> reuniu esse grupo e propôs algo mais estruturado do
          que uma reunião informal: uma organização com nome, identidade e princípios bem definidos.
        </p>
        <p>
          O nome foi dado em homenagem ao próprio fundador — não por vaidade, mas em reconhecimento por ter assumido a
          liderança quando ninguém mais estava disposto a dar o primeiro passo. Desde então, "fazer parte da BECKHAM"
          tornou-se sinônimo de contar com uma rede de apoio sólida.
        </p>
        <p>
          Hoje a organização segue um princípio simples: compromisso acima de tudo, estrutura interna bem definida e
          portas abertas para quem demonstra alinhamento com os valores do grupo.
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
