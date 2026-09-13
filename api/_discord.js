// Compartilhado pelos endpoints de /api. Arquivos com _ no começo não viram rota na Vercel.

// Servidor de onde os cargos são lidos. Hoje é o servidor de TESTE, que é onde o bot está.
// Quando o bot entrar no servidor oficial da BECKHAM (1065057205201678436), basta criar a
// variável DISCORD_GUILD_ID na Vercel com o id novo — não precisa mexer no código.
const TEST_GUILD_ID = '1547760799722901528';

export function guildId() {
  return process.env.DISCORD_GUILD_ID || TEST_GUILD_ID;
}

/**
 * Cargos do servidor, já limpos e com a cor em hex.
 * Lança Error com .status quando o Discord recusa.
 */
export async function fetchGuildRoles(token) {
  const id = guildId();
  const r = await fetch(`https://discord.com/api/v10/guilds/${id}/roles`, {
    headers: { Authorization: `Bot ${token}` },
  });

  if (!r.ok) {
    const err = new Error(
      r.status === 404 ? 'O bot não está dentro desse servidor.' : 'Verifique o DISCORD_BOT_TOKEN.',
    );
    err.status = r.status;
    throw err;
  }

  const roles = await r.json();
  return roles
    // @everyone e cargos de integração (bots, boosters) não servem como cargo de membro.
    .filter((role) => role.name !== '@everyone' && !role.managed)
    .sort((a, b) => b.position - a.position)
    .map((role) => ({
      id: role.id,
      name: role.name,
      position: role.position,
      // 0 no Discord significa "sem cor definida" — vira null pro site usar o padrão dele.
      color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : null,
    }));
}
