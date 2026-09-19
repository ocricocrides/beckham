import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeTable } from '@/context/RealtimeContext';

export type PendingRegistration = {
  member_id: string;
  discord_id: string;
  id_jogo: string;
  nome: string;
  telefone: string;
  recrutador: string;
  submitted_at: string;
  posted_at: string | null;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export type ReviewedRegistration = {
  member_id: string;
  id_jogo: string;
  nome: string;
  telefone: string;
  recrutador: string;
  status: 'aprovado' | 'rejeitado';
  reviewed_at: string | null;
  /** Por onde foi decidido: 'site' ou 'discord' (null em registro antigo sem essa informação). */
  reviewed_source: 'site' | 'discord' | null;
  revisor: string | null;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

/**
 * Registros esperando revisão e os últimos já decididos (undefined = carregando).
 *
 * Vem por RPC em vez de select direto porque quem está pendente ainda não é membro, e o perfil
 * dele fica escondido pela policy de member_profiles pra quem não é admin. As funções no banco
 * (listar_registros_pendentes e listar_registros_revisados) devolvem só os campos que essa tela
 * usa, e devolvem vazio pra quem não tem permissão.
 */
export function usePendingRegistrations() {
  const { canReview } = useAuth();
  const [registrations, setRegistrations] = useState<PendingRegistration[] | undefined>(undefined);
  const [reviewed, setReviewed] = useState<ReviewedRegistration[] | undefined>(undefined);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!canReview) {
      setRegistrations([]);
      setReviewed([]);
      return;
    }
    const [pendentes, revisados] = await Promise.all([
      supabase.rpc('listar_registros_pendentes'),
      supabase.rpc('listar_registros_revisados'),
    ]);
    // Falha de RPC não pode parecer "lista vazia": senão a tela diz que não há registros
    // quando na verdade não conseguiu buscar.
    const falha = pendentes.error ?? revisados.error;
    setError(falha ? `Não foi possível carregar os registros: ${falha.message}` : '');
    setRegistrations(pendentes.error ? [] : ((pendentes.data as PendingRegistration[] | null) ?? []));
    setReviewed(revisados.error ? [] : ((revisados.data as ReviewedRegistration[] | null) ?? []));
  }, [canReview]);

  useEffect(() => {
    reload();
  }, [reload]);

  // O bot e a revisão pelo Discord mexem na mesma tabela: a lista some sozinha quando alguém
  // aprova pelo Discord enquanto essa tela está aberta.
  useRealtimeTable('site_registrations', reload);

  return { registrations, reviewed, error, reload };
}
