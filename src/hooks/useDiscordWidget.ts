import { useEffect, useState } from 'react';
import { DISCORD_INVITE_CODE } from '@/lib/constants';

// Último total conhecido quando isto foi escrito (2026-09-17). Só aparece pra quem nunca abriu
// o site com o Discord respondendo; depois disso vale o número salvo no navegador.
const FALLBACK_MEMBER_COUNT = 2286;
const STORAGE_KEY = 'beckham:discordMemberCount';

function readSavedCount() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved > 0 ? saved : FALLBACK_MEMBER_COUNT;
  } catch {
    return FALLBACK_MEMBER_COUNT;
  }
}

// Usa a API pública de convites (with_counts), que funciona mesmo com o widget do servidor
// desligado. O total de membros fica salvo, então se o Discord parar de responder a página
// continua com o último número. O online não é salvo: sem resposta, a bolinha some.
export function useDiscordWidget() {
  const [memberCount, setMemberCount] = useState(readSavedCount);
  const [presenceCount, setPresenceCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.approximate_member_count !== 'number') return;
        setMemberCount(data.approximate_member_count);
        setPresenceCount(data.approximate_presence_count ?? null);
        try {
          localStorage.setItem(STORAGE_KEY, String(data.approximate_member_count));
        } catch {
          /* navegador sem storage: só não salva */
        }
      })
      .catch(() => {
        /* Discord fora do ar ou rate limit: fica o último número salvo */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { memberCount, presenceCount };
}
