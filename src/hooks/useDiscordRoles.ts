import { useCallback, useEffect, useState } from 'react';

export type DiscordRole = {
  id: string;
  name: string;
  position: number;
  /** Hex, ou null quando o cargo está "sem cor" no Discord. */
  color: string | null;
};

/**
 * Cargos do servidor do Discord, lidos por /api/discord-roles (que usa o token do bot).
 * Só é chamado dentro do painel ADM — as páginas públicas não dependem disso, elas usam a
 * cor já gravada em roles.color.
 */
export function useDiscordRoles(enabled: boolean) {
  const [roles, setRoles] = useState<DiscordRole[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Devolve a lista recém-lida (ou null se falhar), pra quem chamou poder agir na hora. */
  const reload = useCallback(async (): Promise<DiscordRole[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/discord-roles');
      const body = await res.json();
      if (!res.ok) throw new Error(body?.dica || body?.error || 'Falha ao ler os cargos.');
      const lista = body.roles as DiscordRole[];
      setRoles(lista);
      return lista;
    } catch (e) {
      setRoles(null);
      setError(e instanceof Error ? e.message : 'Falha ao ler os cargos do Discord.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && roles === null && !loading && !error) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { discordRoles: roles, error, loading, reload };
}
