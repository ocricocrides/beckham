// Exclui a conta de um membro por completo: usa a API admin do Supabase Auth pra apagar o
// usuário (member_profiles e member_roles caem juntos, via ON DELETE CASCADE). Irreversível —
// a pessoa precisaria se cadastrar de novo do zero.
//
// Precisa confirmar admin no servidor (nunca confiar em "is_admin" vindo do cliente):
//   1. o token de sessão do usuário (Authorization: Bearer <access_token>) é validado no
//      Supabase Auth pra descobrir o id de quem está pedindo;
//   2. esse id passa por is_effective_admin() via RPC com a service role key (mesma função
//      que as policies do banco usam — soma o "is_admin" manual do perfil com qualquer
//      cargo dele marcado como "Administrador").
//
// Variáveis necessárias na Vercel (Production):
//   SUPABASE_SECRET_KEY — já configurada (ver api/sync-discord-colors.js)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tywbicthevgfmukemxwg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d2JpY3RoZXZnZm11a2VteHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODU2NzUsImV4cCI6MjEwNDY2MTY3NX0.Mm2rpXt-6U3kAg4WUOSHYWWlQbDAxUFgzEitn3HUXqE';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getUserIdFromToken(accessToken) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data?.id || null;
}

function serviceHeaders(serviceKey) {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };
}

async function getProfile(userId, serviceKey) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/member_profiles?id=eq.${userId}&select=username,display_name,discord_id`,
    { headers: serviceHeaders(serviceKey) },
  );
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

// Os outros logs do site saem de triggers no banco; a exclusão de conta é feita com a service
// role (sem usuário logado no banco), então o log é gravado aqui, já com quem pediu.
async function logExclusao(caller, target, serviceKey) {
  const alvo = target
    ? target.discord_id ? `<@${target.discord_id}> (@${target.username})` : `@${target.username}`
    : 'conta sem perfil';
  await fetch(`${SUPABASE_URL}/rest/v1/discord_action_log`, {
    method: 'POST',
    headers: { ...serviceHeaders(serviceKey), Prefer: 'return=minimal' },
    body: JSON.stringify({
      action: 'delete_profile',
      subject: alvo,
      actor_display_name: caller?.display_name || null,
      actor_username: caller?.username || null,
      actor_discord_id: caller?.discord_id || null,
    }),
  }).catch(() => {});
}

async function isEffectiveAdmin(userId, serviceKey) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_effective_admin`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_uid: userId }),
  });
  if (!r.ok) return false;
  return (await r.json()) === true;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).send(JSON.stringify({ error: 'Método não permitido.' }));
  }

  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).send(JSON.stringify({ error: 'Falta a variável SUPABASE_SECRET_KEY.' }));
  }

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) {
    return res.status(401).send(JSON.stringify({ error: 'Não autenticado.' }));
  }

  const callerId = await getUserIdFromToken(accessToken);
  if (!callerId || !(await isEffectiveAdmin(callerId, serviceKey))) {
    return res.status(403).send(JSON.stringify({ error: 'Apenas administradores podem fazer isso.' }));
  }

  const { memberId } = req.body || {};
  if (typeof memberId !== 'string' || !UUID_RE.test(memberId)) {
    return res.status(400).send(JSON.stringify({ error: 'memberId inválido.' }));
  }
  if (memberId === callerId) {
    return res.status(400).send(JSON.stringify({ error: 'Não dá pra excluir a própria conta por aqui.' }));
  }

  try {
    const [caller, target] = await Promise.all([getProfile(callerId, serviceKey), getProfile(memberId, serviceKey)]);
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${memberId}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!r.ok && r.status !== 404) {
      console.error('delete-member: Supabase recusou excluir a conta:', r.status, await r.text());
      return res.status(502).send(JSON.stringify({ error: 'Supabase recusou excluir a conta.' }));
    }
    if (r.ok) await logExclusao(caller, target, serviceKey);
    return res.status(200).send(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error('delete-member:', e);
    return res.status(500).send(JSON.stringify({ error: 'Falha ao excluir a conta.' }));
  }
}
