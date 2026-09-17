// Publica um anúncio (criado no site) também como mensagem no Discord, escolhendo o canal
// pelo ID. Existe pra quando o bot do Discord estiver indisponível: o anúncio já é criado
// direto no Supabase pelo cliente, e este endpoint só cuida do "espelho" opcional no Discord.
//
// Precisa confirmar admin no servidor (nunca confiar em "is_admin" vindo do cliente), então:
//   1. o token de sessão do usuário (Authorization: Bearer <access_token>) é validado no
//      Supabase Auth pra descobrir o id do usuário;
//   2. esse id é conferido em member_profiles.is_admin usando a service role key, que
//      passa por cima do RLS (necessário porque este endpoint não tem sessão de usuário).
//
// Variáveis necessárias na Vercel (Production):
//   DISCORD_BOT_TOKEN     — já configurada
//   SUPABASE_SECRET_KEY   — já configurada (Supabase → Project Settings → API Keys → Secret keys)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tywbicthevgfmukemxwg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d2JpY3RoZXZnZm11a2VteHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODU2NzUsImV4cCI6MjEwNDY2MTY3NX0.Mm2rpXt-6U3kAg4WUOSHYWWlQbDAxUFgzEitn3HUXqE';

async function getUserIdFromToken(accessToken) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data?.id || null;
}

async function isAdmin(userId, serviceKey) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/member_profiles?id=eq.${userId}&select=is_admin`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!r.ok) return false;
  const rows = await r.json();
  return !!rows[0]?.is_admin;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).send(JSON.stringify({ error: 'Método não permitido.' }));
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const faltando = [!token && 'DISCORD_BOT_TOKEN', !serviceKey && 'SUPABASE_SECRET_KEY'].filter(Boolean);
  if (faltando.length) {
    return res.status(500).send(JSON.stringify({ error: `Faltam variáveis de ambiente: ${faltando.join(', ')}.` }));
  }

  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) {
    return res.status(401).send(JSON.stringify({ error: 'Não autenticado.' }));
  }

  const userId = await getUserIdFromToken(accessToken);
  if (!userId || !(await isAdmin(userId, serviceKey))) {
    return res.status(403).send(JSON.stringify({ error: 'Apenas administradores podem fazer isso.' }));
  }

  const { channelId, title, body, imageUrl, color } = req.body || {};
  const canal = String(channelId || '').trim();
  if (!/^\d{5,25}$/.test(canal)) {
    return res.status(400).send(JSON.stringify({ error: 'ID do canal do Discord inválido.' }));
  }
  if (!title || !body) {
    return res.status(400).send(JSON.stringify({ error: 'Título e corpo do anúncio são obrigatórios.' }));
  }

  const embed = {
    title: String(title).slice(0, 256),
    description: String(body).slice(0, 4096),
    color: color && /^#[0-9a-fA-F]{6}$/.test(color) ? parseInt(color.slice(1), 16) : 0xff1633,
  };
  if (imageUrl) embed.image = { url: imageUrl };

  try {
    const r = await fetch(`https://discord.com/api/v10/channels/${canal}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!r.ok) {
      console.error('post-discord-message: Discord recusou:', r.status, await r.text());
      const msg =
        r.status === 403
          ? 'O bot não tem permissão para postar nesse canal.'
          : r.status === 404
            ? 'Canal não encontrado (verifique o ID).'
            : `Discord recusou (status ${r.status}).`;
      return res.status(r.status === 404 || r.status === 403 ? r.status : 502).send(
        JSON.stringify({ error: msg }),
      );
    }
    return res.status(200).send(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error('post-discord-message:', e);
    return res.status(500).send(JSON.stringify({ error: 'Falha ao falar com o Discord.' }));
  }
}
