import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Btn } from '@/components/layout/Btn';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  usePendingRegistrations,
  type PendingRegistration,
  type ReviewedRegistration,
} from '@/hooks/usePendingRegistrations';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const ORIGEM_REVISAO: Record<string, string> = { site: 'pelo site', discord: 'pelo Discord' };

function fimDoRegistro(r: ReviewedRegistration) {
  const resultado = r.status === 'aprovado' ? 'Aprovado' : 'Rejeitado';
  const origem = r.reviewed_source ? ORIGEM_REVISAO[r.reviewed_source] : null;
  return { resultado, detalhe: [origem, r.revisor ? `por ${r.revisor}` : null].filter(Boolean).join(' ') };
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className="text-ink-dim text-[0.7rem] font-bold tracking-wide uppercase">{rotulo}</div>
      <div className="text-ink text-[0.9rem] break-words">{valor}</div>
    </div>
  );
}

export default function AdminRegistrosPage() {
  usePageMeta('Registros // Painel ADM', 'Registros enviados pelo site aguardando aprovação da BECKHAM.');

  const { canReview } = useAuth();
  const { registrations, reviewed, error: erroCarga, reload } = usePendingRegistrations();
  const confirm = useConfirm();

  const [emAndamento, setEmAndamento] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');

  function flash(kind: 'error' | 'success', text: string) {
    setMsgKind(kind);
    setMsg(text);
  }

  async function revisar(registro: PendingRegistration, aprovado: boolean) {
    const acao = aprovado ? 'aprovar' : 'rejeitar';
    const ok = await confirm(
      `Tem certeza que quer ${acao} o registro de ${registro.nome} (@${registro.username})?`,
    );
    if (!ok) return;

    setEmAndamento(registro.member_id);
    setMsg('');
    const { error } = await supabase.rpc('revisar_registro', {
      p_member_id: registro.member_id,
      p_aprovado: aprovado,
    });
    setEmAndamento(null);

    if (error) {
      flash('error', error.message);
      return;
    }
    flash(
      'success',
      aprovado
        ? `Registro de ${registro.nome} aprovado. O bot vai dar o cargo no Discord e avisar a pessoa.`
        : `Registro de ${registro.nome} rejeitado. O bot vai avisar a pessoa.`,
    );
    reload();
  }

  if (!canReview) return null;

  return (
    <div>
      <div className="text-ink-dim text-[0.9rem] leading-relaxed mb-6">
        Todo registro, enviado pelo site ou pelo formulário do Discord, aparece aqui. Aprovar aqui
        faz o mesmo que aprovar pelo Discord: o bot dá o cargo, ajusta o apelido, libera o acesso
        de membro no site e manda a mensagem direta.
      </div>

      {erroCarga && <p className="text-brand text-[0.85rem] mb-5">{erroCarga}</p>}

      {msg && (
        <p
          className={cn(
            'text-[0.85rem] mb-5',
            msgKind === 'error' ? 'text-brand' : 'text-ink',
          )}
        >
          {msg}
        </p>
      )}

      {registrations === undefined && <p className="text-ink-dim text-[0.9rem]">Carregando...</p>}

      {registrations?.length === 0 && !erroCarga && (
        <p className="text-ink-dim text-[0.9rem]">Nenhum registro aguardando revisão.</p>
      )}

      <div className="flex flex-col gap-4">
        {registrations?.map((r) => (
          <div key={r.member_id} className="bg-panel border border-line p-5">
            <div className="flex items-center gap-3 mb-4">
              {r.avatar_url && (
                <img
                  src={r.avatar_url}
                  alt=""
                  className="w-10 h-10 object-cover border border-line"
                />
              )}
              <div className="min-w-0">
                <div className="text-ink font-bold text-[0.95rem] truncate">{r.display_name}</div>
                <div className="text-ink-dim text-[0.8rem] truncate">@{r.username}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mb-4">
              <Campo rotulo="ID no jogo" valor={r.id_jogo} />
              <Campo rotulo="Nome" valor={r.nome} />
              <Campo rotulo="Telefone" valor={r.telefone || 'Não informado'} />
              <Campo rotulo="Recrutador" valor={r.recrutador} />
            </div>

            <div className="text-ink-dim text-[0.78rem] mb-4">
              Enviado em {dataHora.format(new Date(r.submitted_at))}.{' '}
              {r.posted_at ? 'Já apareceu no Discord.' : 'Ainda não foi pro Discord.'}
            </div>

            <div className="flex gap-3">
              <Btn
                variant="primary"
                disabled={emAndamento === r.member_id}
                onClick={() => revisar(r, true)}
              >
                <Check className="w-4 h-4 mr-1.5" />
                Aprovar
              </Btn>
              <Btn
                variant="outline"
                disabled={emAndamento === r.member_id}
                onClick={() => revisar(r, false)}
              >
                <X className="w-4 h-4 mr-1.5" />
                Rejeitar
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {reviewed && reviewed.length > 0 && (
        <div className="mt-10">
          <h2 className="text-ink font-bold text-[1rem] mb-1">Já revisados</h2>
          <p className="text-ink-dim text-[0.8rem] mb-4">
            Os 30 mais recentes, com o resultado e por onde foram decididos.
          </p>

          <div className="flex flex-col gap-3">
            {reviewed.map((r) => {
              const { resultado, detalhe } = fimDoRegistro(r);
              return (
                <div key={r.member_id} className="bg-panel border border-line p-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
                    <div className="min-w-0">
                      <span className="text-ink font-bold text-[0.9rem]">{r.display_name}</span>{' '}
                      <span className="text-ink-dim text-[0.8rem]">@{r.username}</span>
                    </div>
                    <div
                      className={cn(
                        'text-[0.85rem] font-bold',
                        r.status === 'aprovado' ? 'text-ink' : 'text-brand',
                      )}
                    >
                      {resultado}
                      {detalhe && <span className="font-normal text-ink-dim"> {detalhe}</span>}
                    </div>
                    {r.reviewed_at && (
                      <div className="text-ink-dim text-[0.78rem]">
                        {dataHora.format(new Date(r.reviewed_at))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                    <Campo rotulo="ID no jogo" valor={r.id_jogo} />
                    <Campo rotulo="Nome" valor={r.nome} />
                    <Campo rotulo="Telefone" valor={r.telefone || 'Não informado'} />
                    <Campo rotulo="Recrutador" valor={r.recrutador} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
