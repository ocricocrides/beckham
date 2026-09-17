export const DEFAULT_AVATAR = '/assets/perfil-default.webp';
export const DEFAULT_BANNER = '/assets/banner.png';

// Guild da BECKHAM (convite permanente, sem expiração).
export const DISCORD_GUILD_ID = '1065057205201678436';

// Único canal de suporte e contato da organização.
export const DISCORD_INVITE_CODE = 'nTzzbPgmw2';
export const DISCORD_INVITE = `https://discord.gg/${DISCORD_INVITE_CODE}`;

// Canal #ticket (categoria ENTRE EM CONTATO) criado pelo bot. Enquanto o ID do canal não for
// preenchido, os botões de "abrir ticket" caem no convite do servidor.
export const TICKET_CHANNEL_ID = '';
export const TICKET_URL = TICKET_CHANNEL_ID
  ? `https://discord.com/channels/${DISCORD_GUILD_ID}/${TICKET_CHANNEL_ID}`
  : DISCORD_INVITE;

export const SITE_URL = 'https://beckhamrp.vercel.app';

export const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/membros', label: 'Membros' },
  { to: '/streamers', label: 'Streamers' },
  { to: '/fotos', label: 'Fotos' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/historia', label: 'História' },
] as const;
