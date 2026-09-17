import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { Btn } from '@/components/layout/Btn';
import { FormField, inputClass } from '@/components/layout/FormField';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useDiscordLink } from '@/hooks/useDiscordLink';
import { useMyRegistration } from '@/hooks/useMyRegistration';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/lib/supabase';
import { DISCORD_INVITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

function Step({ number, title, done, disabled, children }: { number: number; title: string; done?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <section className={cn('bg-panel border border-line p-6 max-[520px]:p-4', disabled && 'opacity-50')}>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={cn(
            'w-8 h-8 shrink-0 flex items-center justify-center border font-display font-bold text-[0.9rem]',
            done ? 'bg-brand border-brand text-[#0a0a0a]' : 'border-line text-ink-dim',
          )}
        >
          {done ? '✓' : number}
        </span>
        <h3 className="text-ink font-bold text-[1.1rem] tracking-wide">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DiscordStep() {
  const { profile } = useAuth();
  const { status, refresh, generate } = useDiscordLink();
  const linked = !!profile?.discord_id;

  useEffect(() => {
    refresh();
  }, [refresh, profile?.discord_id]);

  return (
    <Step number={1} title="Vincular o Discord" done={linked}>
      {linked ? (
        <p className="text-ink-dim text-[0.9rem]">Sua conta do site está vinculada ao seu Discord.</p>
      ) : (
        <>
          <p className="text-ink-dim text-[0.9rem] mb-4">
            Gere um código e rode o comando no servidor da BECKHAM. Ainda não está no servidor?{' '}
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-brand hover:underline">
              Entre por aqui
            </a>
            .
          </p>
          {status?.code ? (
            <div className="bg-panel-2 border border-line px-4 py-3 mb-4">
              <p className="text-ink-dim text-[0.8rem] mb-1">Rode no Discord (expira em 15 minutos):</p>
              <code className="text-ink font-bold text-[1.05rem] break-all select-all">/vincular codigo:{status.code}</code>
            </div>
          ) : (
            <p className="text-ink-dim text-[0.85rem] mb-4">{status?.text ?? 'Carregando...'}</p>
          )}
          <Btn type="button" variant="outline" onClick={generate}>
            {status?.code ? 'Gerar outro código' : 'Gerar código'}
          </Btn>
        </>
      )}
    </Step>
  );
}

function FormStep() {
  const { profile } = useAuth();
  const { registration, reload } = useMyRegistration();
  const linked = !!profile?.discord_id;

  const [idJogo, setIdJogo] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [recrutador, setRecrutador] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Reenvio depois de rejeitado já vem com o que a pessoa tinha mandado.
  useEffect(() => {
    if (!registration) return;
    setIdJogo(registration.id_jogo);
    setNome(registration.nome);
    setTelefone(registration.telefone);
    setRecrutador(registration.recrutador);
  }, [registration]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    const { error: err } = await supabase.rpc('enviar_registro', {
      p_id_jogo: idJogo,
      p_nome: nome,
      p_telefone: telefone,
      p_recrutador: recrutador,
    });
    setSending(false);
    if (err) {
      setError(err.message);
      return;
    }
    reload();
  }

  if (registration === undefined) {
    return (
      <Step number={2} title="Formulário de registro">
        <div className="skeleton h-[120px]" />
      </Step>
    );
  }

  if (registration?.status === 'pendente') {
    return (
      <Step number={2} title="Formulário de registro" done>
        <p className="text-ink font-bold mb-1">⏳ Registro enviado</p>
        <p className="text-ink-dim text-[0.9rem]">
          A staff vai analisar no Discord. Assim que for aprovado, seu acesso de membro é liberado aqui automaticamente e você recebe
          uma mensagem no privado do Discord.
        </p>
      </Step>
    );
  }

  if (registration?.status === 'aprovado') {
    return (
      <Step number={2} title="Formulário de registro" done>
        <p className="text-ink-dim text-[0.9rem]">Registro aprovado! Liberando seu acesso...</p>
      </Step>
    );
  }

  return (
    <Step number={2} title="Formulário de registro" disabled={!linked}>
      {registration?.status === 'rejeitado' && (
        <p className="text-brand text-[0.9rem] mb-4">
          Seu último registro foi rejeitado pela staff. Confira os dados e envie de novo, ou fale com a staff no Discord.
        </p>
      )}
      {!linked && <p className="text-ink-dim text-[0.9rem] mb-4">Vincule o Discord primeiro para liberar o formulário.</p>}
      <form className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-4" onSubmit={handleSubmit}>
        <FormField label="ID no jogo" htmlFor="regIdJogo">
          <Input
            id="regIdJogo"
            required
            inputMode="numeric"
            maxLength={20}
            placeholder="Ex: 12345"
            disabled={!linked}
            className={inputClass}
            value={idJogo}
            onChange={(e) => setIdJogo(e.target.value.replace(/\D/g, ''))}
          />
        </FormField>
        <FormField label="Nome do membro" htmlFor="regNome">
          <Input id="regNome" required maxLength={32} placeholder="Ex: João Silva" disabled={!linked} className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} />
        </FormField>
        <FormField label="Número de telefone" htmlFor="regTelefone">
          <Input
            id="regTelefone"
            required
            type="tel"
            maxLength={20}
            placeholder="Ex: 11987654321"
            disabled={!linked}
            className={inputClass}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </FormField>
        <FormField label="Nome do recrutador" htmlFor="regRecrutador">
          <Input id="regRecrutador" required maxLength={32} placeholder="Ex: Neco" disabled={!linked} className={inputClass} value={recrutador} onChange={(e) => setRecrutador(e.target.value)} />
        </FormField>
        <div className="col-span-full flex items-center gap-4 flex-wrap">
          <Btn type="submit" variant="primary" disabled={!linked || sending}>
            {sending ? 'Enviando...' : 'Enviar registro'}
          </Btn>
          {error && <span className="text-brand text-[0.85rem]">{error}</span>}
        </div>
      </form>
    </Step>
  );
}

export default function RegistroPage() {
  usePageMeta('Registro', 'Entre para a BECKHAM: crie sua conta, vincule o Discord e envie seu registro para a staff.');
  const { user, profile, isMember, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  let content: ReactNode;
  if (loading || (user && !profile)) {
    content = <div className="skeleton h-[240px]" />;
  } else if (!user) {
    content = (
      <div className="bg-panel border border-line p-6">
        <p className="text-ink mb-2 font-bold">Como funciona</p>
        <ol className="text-ink-dim text-[0.9rem] mb-5 list-decimal pl-5 flex flex-col gap-1">
          <li>Crie sua conta no site.</li>
          <li>Vincule seu Discord com um código.</li>
          <li>Preencha o registro e aguarde a staff aprovar.</li>
        </ol>
        <Btn variant="primary" onClick={() => setAuthOpen(true)}>
          Entrar / Criar conta
        </Btn>
      </div>
    );
  } else if (isMember) {
    content = (
      <div className="bg-panel border border-line p-6">
        <p className="text-ink font-bold mb-2">Você já é membro da BECKHAM.</p>
        <p className="text-ink-dim text-[0.9rem] mb-5">Seu registro está aprovado e o acesso de membro liberado.</p>
        <Btn variant="outline" onClick={() => navigate('/membros')}>
          Ver membros
        </Btn>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <p className="text-ink-dim text-[0.9rem]">
          Logado como <span className="text-brand font-bold">@{profile!.username}</span>. Sua conta só vira conta de membro depois que a staff
          aprovar o registro.
        </p>
        <DiscordStep />
        <FormStep />
        <div>
          <Btn variant="outline" onClick={signOut}>
            Sair da conta
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <Wrap>
      <SectionHead title="Registro" description="Faça parte da BECKHAM." />
      <div className="max-w-[760px] py-10 pb-24">{content}</div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </Wrap>
  );
}
