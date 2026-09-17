import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface DiscordLinkStatus {
  text: string;
  /** Código ativo pra rodar /vincular no Discord. */
  code?: string;
}

/** Vínculo da conta do site com o Discord: o site gera o código e o bot confirma no /vincular. */
export function useDiscordLink() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<DiscordLinkStatus | null>(null);
  const generatingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!profile || !user) return;
    if (profile.discord_id) {
      setStatus({ text: '✅ Sua conta está vinculada ao Discord.' });
      return;
    }
    const { data } = await supabase
      .from('discord_link_requests')
      .select('*')
      .eq('member_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      setStatus({ text: 'Você ainda não vinculou sua conta ao Discord.' });
      return;
    }
    const expirado = new Date(data.expires_at) < new Date();
    if (data.status === 'pending_code' && !expirado) {
      setStatus({ text: `Rode /vincular codigo:${data.code} no Discord. Expira em 15 minutos.`, code: data.code });
    } else if (data.status === 'pending_approval') {
      setStatus({ text: '⏳ Pedido enviado, aguardando a staff no Discord.' });
    } else if (data.status === 'rejected') {
      setStatus({ text: '❌ Seu último pedido de vínculo foi rejeitado. Gere um novo código se quiser tentar de novo.' });
    } else {
      setStatus({ text: expirado ? 'O código anterior expirou. Gere um novo.' : 'Você ainda não vinculou sua conta ao Discord.' });
    }
  }, [profile, user]);

  const generate = useCallback(async () => {
    if (!user || generatingRef.current) return;
    generatingRef.current = true;
    setStatus({ text: 'Gerando código...' });
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await supabase.from('discord_link_requests').insert({ member_id: user.id, code: codigo });
    generatingRef.current = false;
    if (error) {
      setStatus({ text: 'Erro ao gerar código: ' + error.message });
      return;
    }
    await refresh();
  }, [user, refresh]);

  return { status, refresh, generate };
}
