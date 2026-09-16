// Manda uma linha de log no Discord toda vez que alguém posta/apaga/restaura uma foto ou um
// anúncio pelo site. Quem pode fazer essas ações já foi conferido pelo RLS do Supabase na hora
// de gravar (roles.can_post_photos / can_delete_photos / can_post_announcements /
// can_delete_announcements, ou ser admin) — este endpoint só identifica quem é (via token de
// sessão) e manda a mensagem; não precisa reconferir permissão de novo.
//
// Canal fixo por enquanto (DISCORD_LOG_CHANNEL_ID na Vercel pode sobrescrever). Combinado com o
// usuário: mais pra frente esse canal passa a ser configurado dentro do próprio NovoBot
// (comando /configurar), junto da sincronização diária — aí este valor vira só o fallback.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tywbicthevgfmukemxwg.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d2JpY3RoZXZnZm11a2VteHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODU2NzUsImV4cCI6MjEwNDY2MTY3NX0.Mm2rpXt-6U3kAg4WUOSHYWWlQbDAxUFgzEitn3HUXqE';
const CONTENT_LOG_CHANNEL_ID = process.env.DISCORD_LOG_CHANNEL_ID || '1549575526010716212';
// Canal de logs de conta (excluir/renomear perfil) — ainda não configurado; sem valor aqui até
// o usuário passar o ID (fica igual ao canal de "perfil verificado" do NovoBot).
const PROFILE_LOG_CHANNEL_ID = process.env.DISCORD_PROFILE_LOG_CHANNEL_ID || '';

const ACTIONS = {
  post_photo: { label: 'postou uma foto', channelId: CONTENT_LOG_CHANNEL_ID },
  delete_photo: { label: 'apagou uma foto', channelId: CONTENT_LOG_CHANNEL_ID },
  restore_photo: { label: 'restaurou uma foto', channelId: CONTENT_LOG_CHANNEL_ID },
  post_announcement: { label: 'postou um anúncio', channelId: CONTENT_LOG_CHANNEL_ID },
  delete_announcement: { label: 'apagou um anúncio', channelId: CONTENT_LOG_CHANNEL_ID },
  restore_announcement: { label: 'restaurou um anúncio', channelId: CONTENT_LOG_CHANNEL_ID },
  delete_profile: { label: 'excluiu a conta de', channelId: PROFILE_LOG_CHANNEL_ID },
  rename_profile: { label: 'renomeou', channelId: PROFILE_LOG_CHANNEL_ID },
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
  if (!userId) {
    return res.status(401).send(JSON.stringify({ error: 'Sessão inválida.' }));
  }

  const { action, subject } = req.body || {};
  const acao = ACTIONS[action];
  if (!acao) {
    return res.status(400).send(JSON.stringify({ error: 'Ação de log inválida.' }));
  }
  if (!acao.channelId) {
    return res.status(500).send(
      JSON.stringify({ error: 'Canal de log não configurado pra essa ação (DISCORD_PROFILE_LOG_CHANNEL_ID).' }),
    );
  }

  const actor = await getActor(userId, serviceKey);
  const quem = actor?.display_name || actor?.username || 'alguém';
  const assunto = subject ? String(subject).slice(0, 200) : '';
  const texto = `**@${quem}** ${acao.label}${assunto ? `: **${assunto}**` : ''}`;

  try {
    const r = await fetch(`https://discord.com/api/v10/channels/${acao.channelId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: texto.slice(0, 2000), allowed_mentions: { parse: [] } }),
    });
    if (!r.ok) {
      const detalhe = await r.text();
      return res.status(502).send(JSON.stringify({ error: 'Discord recusou o log.', dica: detalhe }));
    }
    return res.status(200).send(JSON.stringify({ ok: true }));
  } catch (e) {
    return res.status(500).send(JSON.stringify({ error: 'Falha ao falar com o Discord.', dica: e.message }));
  }
}
