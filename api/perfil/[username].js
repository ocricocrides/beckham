// Serverless function (Vercel) que serve uma página HTML mínima com meta tags Open Graph
// corretas por perfil, pra quando o link /perfil/<username> for compartilhado no
// Discord/WhatsApp/Twitter (esses crawlers não executam JS, então o SPA de hash normal
// nunca teria uma prévia certa). Um navegador de verdade é redirecionado na hora pro
// SPA real (#perfil/<username>); o crawler só lê os <meta> e não segue o redirect.
const SUPABASE_URL = 'https://tywbicthevgfmukemxwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d2JpY3RoZXZnZm11a2VteHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODU2NzUsImV4cCI6MjEwNDY2MTY3NX0.Mm2rpXt-6U3kAg4WUOSHYWWlQbDAxUFgzEitn3HUXqE';

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

export default async (req, res) => {
  const username = String(req.query.username || '').toLowerCase();
  let profile = null;

  try {
    const url = `${SUPABASE_URL}/rest/v1/member_profiles?username=eq.${encodeURIComponent(username)}&select=display_name,username,bio,avatar_url,banner_url,share_image`;
    const r = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    const data = await r.json();
    profile = Array.isArray(data) ? data[0] : null;
  } catch (e) {
    console.error('Erro ao buscar perfil para OG:', e);
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;
  const redirectPath = `/#perfil/${encodeURIComponent(username)}`;

  const title = profile ? `${profile.display_name || profile.username} — BECKHAM` : 'BECKHAM // Organização FiveM';
  const description = (profile && profile.bio) ? profile.bio : 'Organização de roleplay FiveM.';
  // Segue a preferência salva pelo membro (Avatar/Banner); se a imagem escolhida não
  // existir, cai pra outra disponível antes do fallback genérico.
  const preferBanner = profile && profile.share_image === 'banner';
  const chosen = profile && (preferBanner ? (profile.banner_url || profile.avatar_url) : (profile.avatar_url || profile.banner_url));
  const image = chosen || `${baseUrl}/assets/logo.png`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(profile ? 200 : 404).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:type" content="profile">
<meta property="og:url" content="${escapeHtml(baseUrl + '/perfil/' + username)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${escapeHtml(redirectPath)}">
<script>location.replace(${JSON.stringify(redirectPath)});</script>
</head>
<body></body>
</html>`);
};
