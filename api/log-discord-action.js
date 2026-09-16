// Grava uma linha em discord_action_log toda vez que alguém posta/apaga/restaura uma foto ou um
// anúncio pelo site (ou apaga/renomeia perfil). Quem pode fazer essas ações já foi conferido
// pelo RLS do Supabase na hora de gravar (roles.can_post_photos / can_delete_photos /
// can_post_announcements / can_delete_announcements, ou ser admin) — este endpoint só identifica
// quem é (via token de sessão) e registra a ação; não precisa reconferir permissão de novo.
//
// O NovoBot assina discord_action_log via Realtime, manda a mensagem no Discord e depois
// preenche processed_at — este endpoint não fala mais com a API do Discord.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tywbicthevgfmukemxwg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d2JpY3RoZXZnZm11a2VteHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODU2NzUsImV4cCI6MjEwNDY2MTY3NX0.Mm2rpXt-6U3kAg4WUOSHYWWlQbDAxUFgzEitn3HUXqE';

const ACTIONS = {
  post_photo: { label: 'postou uma foto' },
  delete_photo: { label: 'apagou uma foto' },
  restore_photo: { label: 'restaurou uma foto' },
  post_announcement: { label: 'postou um anúncio' },
  delete_announcement: { label: 'apagou um anúncio' },
  restore_announcement: { label: 'restaurou um anúncio' },
  delete_profile: { label: 'excluiu a conta de' },
  rename_profile: { label: 'renomeou' },
  rename_role: { label: 'renomeou o cargo' },
};

async function getUserIdFromToken(accessToken) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data?.id || null;
}

async function getActor(userId, serviceKey) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/member_profiles?id=eq.${userId}&select=username,display_name`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).send(JSON.stringify({ error: 'Método não permitido.' }));
  }

  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).send(JSON.stringify({ error: 'Falta variável de ambiente: SUPABASE_SECRET_KEY.' }));
  }

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) {
    return res.status(401).send(JSON.stringify({ error: 'Não autenticado.' }));
  }

  const userId = await getUserIdFromToken(accessToken);
  if (!userId) {
    return res.status(401).send(JSON.stringify({ error: 'Sessão inválida.' }));
  }

  const { action, subject, image_url } = req.body || {};
  if (!ACTIONS[action]) {
    return res.status(400).send(JSON.stringify({ error: 'Ação de log inválida.' }));
  }

  const actor = await getActor(userId, serviceKey);
  const assunto = subject ? String(subject).slice(0, 200) : '';

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/discord_action_log`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        action,
        subject: assunto,
        actor_display_name: actor?.display_name || null,
        actor_username: actor?.username || null,
        image_url: image_url || null,
      }),
    });
    if (!r.ok) {
      const detalhe = await r.text();
      return res.status(502).send(JSON.stringify({ error: 'Supabase recusou o log.', dica: detalhe }));
    }
    return res.status(200).send(JSON.stringify({ ok: true }));
  } catch (e) {
    return res.status(500).send(JSON.stringify({ error: 'Falha ao gravar o log.', dica: e.message }));
  }
}
