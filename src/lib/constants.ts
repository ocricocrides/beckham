export const DEFAULT_AVATAR = '/assets/perfil-default.webp';
export const DEFAULT_BANNER = '/assets/banner.png';

// Guild da BECKHAM (a mesma por trás do convite discord.gg/beckham). A contagem de online só
// aparece se o "Widget do servidor" estiver ligado nas configurações do Discord — hoje está
// desligado, então o widget devolve 403 e a página cai no convite fixo abaixo.
export const DISCORD_GUILD_ID = '1065057205201678436';

// Único canal de suporte e contato da organização.
export const DISCORD_INVITE = 'https://discord.gg/beckham';

export const SITE_URL = 'https://beckhamrp.vercel.app';

export const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/membros', label: 'Membros' },
  { to: '/fotos', label: 'Fotos' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/historia', label: 'História' },
] as const;
