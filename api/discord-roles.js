// Lista os cargos do servidor do Discord com as cores de lá, pra que o painel ADM possa
// espelhar um cargo do site num cargo do Discord e herdar a cor.
import { fetchGuildRoles, guildId } from './_discord.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send(
      JSON.stringify({ error: 'DISCORD_BOT_TOKEN não está configurado neste deploy.' }),
    );
  }

  try {
    const roles = await fetchGuildRoles(token);
    return res.status(200).send(JSON.stringify({ guildId: guildId(), roles }));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(e.status || 500).send(
      JSON.stringify({ error: 'Não consegui ler os cargos do Discord.', dica: e.message }),
    );
  }
}
