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

/**
 * Registros esperando revisão (undefined = carregando).
 *
 * Vem por RPC em vez de select direto porque quem está pendente ainda não é membro, e o perfil
 * dele fica escondido pela policy de member_profiles pra quem não é admin. A função no banco
 * (listar_registros_pendentes) devolve só os campos que essa tela usa, e devolve vazio pra quem
 * não tem permissão.
 */
export function usePendingRegistrations() {
  const { canReview } = useAuth();
  const [registrations, setRegistrations] = useState<PendingRegistration[] | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!canReview) {
      setRegistrations([]);
      return;
    }
    const { data } = await supabase.rpc('listar_registros_pendentes');
    setRegistrations((data as PendingRegistration[] | null) ?? []);
  }, [canReview]);

  useEffect(() => {
    reload();
  }, [reload]);

  // O bot e a revisão pelo Discord mexem na mesma tabela: a lista some sozinha quando alguém
  // aprova pelo Discord enquanto essa tela está aberta.
  useRealtimeTable('site_registrations', reload);

  return { registrations, reload };
}
