import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface PresenceContextValue {
  /** ids de member_profiles que estão com o site aberto agora. */
  onlineIds: Set<string>;
}

const PresenceContext = createContext<PresenceContextValue>({ onlineIds: new Set() });

/**
 * Presença "no site" via Supabase Realtime Presence (broadcast efêmero, não é uma tabela).
 * Todo mundo logado entra no mesmo canal e se anuncia; visitante anônimo só escuta.
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel('site-presence', {
      config: { presence: { key: user?.id || crypto.randomUUID() } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      setOnlineIds(new Set(Object.keys(channel.presenceState())));
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && user) {
        channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return <PresenceContext.Provider value={{ onlineIds }}>{children}</PresenceContext.Provider>;
}

export function usePresence() {
  return useContext(PresenceContext);
}
