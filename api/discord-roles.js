// Lista os cargos do servidor do Discord com as cores de lá, pra que o painel ADM possa
// espelhar um cargo do site num cargo do Discord e herdar a cor.
//
// A cor no Discord vem como inteiro decimal (0 = "sem cor", que o cliente renderiza como
// cinza padrão); aqui ela é convertida pra hex. Precisa do DISCORD_BOT_TOKEN nas variáveis
// de ambiente da Vercel, e o bot precisa estar dentro do servidor.
const GUILD_ID = '1065057205201678436';

// Busca os cargos de um servidor. Devolve { ok, status, body }.
async function fetchRoles(guildId, token) {
  const r = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${token}` },
  });
  return { ok: r.ok, status: r.status, body: r.ok ? await r.json() : await r.text() };
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return res.status(500).send(
      JSON.stringify({ error: 'DISCORD_BOT_TOKEN não está configurado neste deploy.' }),
    );
  }

  try {
    let guildId = GUILD_ID;
    let attempt = await fetchRoles(guildId, token);

    // Se o bot não estiver no servidor configurado, descobre em quais ele está. Quando há só
    // um, usa esse — evita depender de um id chumbado que pode não bater com o bot real.
    if (!attempt.ok) {
      const gr = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bot ${token}` },
      });
      const guilds = gr.ok ? await gr.json() : [];
      if (guilds.length === 1) {
        guildId = guilds[0].id;
        attempt = await fetchRoles(guildId, token);
      } else if (guilds.length > 1) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(409).send(
          JSON.stringify({
            error: 'O bot está em mais de um servidor. Diga qual usar.',
            guildConfigurado: GUILD_ID,
            servidoresDoBot: guilds.map((g) => ({ id: g.id, name: g.name })),
          }),
        );
      }
    }

    if (!attempt.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(attempt.status).send(
        JSON.stringify({
          error: 'Não consegui ler os cargos do Discord.',
          discordStatus: attempt.status,
          discordBody: String(attempt.body).slice(0, 300),
          tokenValido: true,
          guildTentado: guildId,
          dica: 'O bot precisa estar dentro do servidor pra enxergar os cargos.',
        }),
      );
    }

    const roles = attempt.body;
    const limpos = roles
      // @everyone e cargos de integração (bots, boosters) não servem como cargo de membro.
      .filter((role) => role.name !== '@everyone' && !role.managed)
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        id: role.id,
        name: role.name,
        position: role.position,
        // 0 no Discord significa "sem cor definida" — devolve null pro site usar o padrão dele.
        color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : null,
      }));

    return res.status(200).send(JSON.stringify({ guildId, roles: limpos }));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).send(JSON.stringify({ error: String(e && e.message) }));
  }
}
