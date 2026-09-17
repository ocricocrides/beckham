import { useEffect, useState } from 'react';
import { useProfiles } from '@/hooks/useProfiles';
import { useRoles } from '@/hooks/useRoles';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-panel-2 border border-line px-5 py-4">
      <div className="text-ink text-[1.8rem] font-bold font-display">{value}</div>
      <div className="text-ink-dim text-[0.78rem] tracking-wide uppercase mt-1">{label}</div>
    </div>
  );
}

type Ticket = Pick<Tables<'discord_tickets'>, 'category' | 'status' | 'source_member_id' | 'source_text' | 'created_at'>;

const CATEGORY_LABEL: Record<string, string> = {
  recrutamento: 'Quero ser recrutado',
  streamer: 'Quero ser streamer',
  duvidas: 'Dúvidas',
  proposta: 'Propostas',
  denuncia: 'Denúncias',
};

/** Tickets que o bot grava no banco (a RLS só libera a leitura pra ADM). */
function useTickets() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  useEffect(() => {
    const desde = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
    supabase
      .from('discord_tickets')
      .select('category, status, source_member_id, source_text, created_at')
      .gte('created_at', desde)
      .then(({ data }) => setTickets(data ?? []));
  }, []);
  return tickets;
}

export default function AdminInicioPage() {
  usePageMeta('Painel ADM', 'Área restrita de administração da BECKHAM.');
  const { profiles, loading: loadingProfiles } = useProfiles();
  const { roles, loading: loadingRoles } = useRoles();
  const tickets = useTickets();
  const admins = profiles?.filter((p) => p.is_admin).length ?? 0;
  const streamers = profiles?.filter((p) => p.roles.some((r) => r.is_streamer)).length ?? 0;

  const abertos = tickets?.filter((t) => t.status === 'aberto').length ?? 0;
  const porCategoria = Object.keys(CATEGORY_LABEL).map((c) => ({
    c,
    total: tickets?.filter((t) => t.category === c).length ?? 0,
  }));

  // Quem trouxe cada recruta: pelo membro ligado no ticket ou, se não tiver, pelo texto que a pessoa escreveu.
  const origem = new Map<string, number>();
  for (const t of tickets ?? []) {
    if (t.category !== 'recrutamento') continue;
    const membro = profiles?.find((p) => p.id === t.source_member_id);
    const nome = membro ? membro.display_name || membro.username : t.source_text?.trim() || 'Não informado';
    origem.set(nome, (origem.get(nome) ?? 0) + 1);
  }
  const ranking = [...origem.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h4 className="text-ink text-[1rem] tracking-wide mb-5">Visão geral</h4>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        <StatCard label="Membros" value={loadingProfiles ? '…' : (profiles?.length ?? 0)} />
        <StatCard label="Streamers" value={loadingProfiles ? '…' : streamers} />
        <StatCard label="Cargos" value={loadingRoles ? '…' : roles.length} />
        <StatCard label="Admins" value={loadingProfiles ? '…' : admins} />
      </div>

      <h4 className="text-ink text-[1rem] tracking-wide mt-10 mb-1">Tickets do Discord (30 dias)</h4>
      <p className="text-ink-dim text-[0.78rem] mb-4">
        Preenchido pelo bot quando alguém abre ticket no #ticket. {tickets && `${abertos} aberto(s) agora.`}
      </p>
      {tickets === null ? (
        <p className="text-ink-dim text-[0.85rem]">Carregando…</p>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
            {porCategoria.map(({ c, total }) => (
              <StatCard key={c} label={CATEGORY_LABEL[c]} value={total} />
            ))}
          </div>

          <h4 className="text-ink text-[0.9rem] tracking-wide mt-8 mb-3">Quem trouxe os recrutas</h4>
          {ranking.length === 0 ? (
            <p className="text-ink-dim text-[0.85rem]">Nenhum pedido de recrutamento nos últimos 30 dias.</p>
          ) : (
            <ol className="flex flex-col gap-1.5 max-w-[420px]">
              {ranking.map(([nome, total], i) => (
                <li key={nome} className="flex items-center justify-between bg-panel-2 border border-line px-3 py-2 text-[0.85rem]">
                  <span className="text-ink">
                    <span className="text-ink-dim mr-2">{i + 1}.</span>
                    {nome}
                  </span>
                  <span className="text-brand font-bold">{total}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
