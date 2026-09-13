// Cron diário: repuxa as cores dos cargos que estão espelhados no Discord.
//
// Escrever em `roles` é bloqueado pelo RLS pra quem não é admin logado, e um cron não tem
// sessão de usuário. Por isso este endpoint usa a service role key do Supabase, que passa por
// cima do RLS — e por isso ele só toca na coluna `color`, e só em linhas que já têm
// discord_role_id preenchido. Nada mais.
//
// Variáveis necessárias na Vercel (Production):
//   DISCORD_BOT_TOKEN          — já configurada
//   SUPABASE_SERVICE_ROLE_KEY  — Supabase → Project Settings → API → service_role
//   CRON_SECRET                — opcional, mas recomendada: a Vercel manda ela no header
//                                Authorization das chamadas de cron, e sem isso o endpoint
//                                fica aberto pra qualquer um disparar.
import { fetchGuildRoles } from './_discord.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tywbicthevgfmukemxwg.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).send(JSON.stringify({ error: 'Não autorizado.' }));
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const faltando = [
    !token && 'DISCORD_BOT_TOKEN',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean);
  if (faltando.length) {
    return res.status(500).send(
      JSON.stringify({ error: `Faltam variáveis de ambiente: ${faltando.join(', ')}.` }),
    );
  }

  const auth = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

  try {
    const discordRoles = await fetchGuildRoles(token);

    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/roles?select=id,name,color,discord_role_id&discord_role_id=not.is.null`,
      { headers: auth },
    );
    if (!r.ok) throw new Error(`Supabase respondeu ${r.status} ao ler os cargos.`);
    const vinculados = await r.json();

    const mudancas = [];
    for (const cargo of vinculados) {
      const doDiscord = discordRoles.find((d) => d.id === cargo.discord_role_id);
      // Cargo apagado no Discord: deixa a cor como está, pra não zerar sem aviso.
      if (!doDiscord || doDiscord.color === cargo.color) continue;

      const up = await fetch(`${SUPABASE_URL}/rest/v1/roles?id=eq.${cargo.id}`, {
        method: 'PATCH',
        headers: { ...auth, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ color: doDiscord.color }),
      });
      if (up.ok) mudancas.push({ cargo: cargo.name, de: cargo.color, para: doDiscord.color });
    }

    return res.status(200).send(
      JSON.stringify({ ok: true, vinculados: vinculados.length, atualizados: mudancas }),
    );
  } catch (e) {
    return res.status(e.status || 500).send(JSON.stringify({ error: e.message }));
  }
}
