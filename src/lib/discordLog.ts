import { supabase } from '@/lib/supabase';

export type LogAction =
  | 'post_photo'
  | 'delete_photo'
  | 'restore_photo'
  | 'post_announcement'
  | 'delete_announcement'
  | 'restore_announcement'
  | 'delete_profile'
  | 'rename_profile';

/**
 * Manda um log da ação (quem postou/apagou/restaurou o quê) pro canal do Discord configurado
 * em api/log-discord-action.js. Best-effort: nunca deve travar a ação principal (postar/apagar
 * já aconteceu no Supabase antes disso) — falha aqui só fica no console.
 */
export async function logDiscordAction(action: LogAction, subject?: string, imageUrl?: string | null) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch('/api/log-discord-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, subject, image_url: imageUrl ?? null }),
    });
  } catch (e) {
    console.warn('Log do Discord falhou:', e);
  }
}
