import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// A conta é criada com a service role, que não passa pelo limite de cadastro do Supabase Auth.
// Por isso o limite fica aqui: no máximo MAX_CONTAS_POR_IP contas por IP a cada JANELA_MINUTOS.
// O IP é guardado só como hash (public.signup_attempts). Se a consulta do limite falhar, o
// cadastro segue normalmente, pra um erro no limite nunca travar quem quer entrar.
const MAX_CONTAS_POR_IP = 5;
const JANELA_MINUTOS = 60;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function hashIp(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'desconhecido';
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`beckham-signup:${ip}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    return json({ error: 'Nome de usuário inválido: use 3 a 20 letras minúsculas, números, . ou _' }, 400);
  }
  if (password.length < 6 || password.length > 72) {
    return json({ error: 'A senha precisa ter entre 6 e 72 caracteres' }, 400);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const ipHash = await hashIp(req);
  const desde = new Date(Date.now() - JANELA_MINUTOS * 60_000).toISOString();
  const { count, error: limiteError } = await admin
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', desde);
  if (limiteError) {
    console.error('signup: falha ao consultar limite', limiteError);
  } else if ((count ?? 0) >= MAX_CONTAS_POR_IP) {
    return json({ error: 'Muitas contas criadas a partir desta rede. Tente de novo mais tarde.' }, 429);
  }

  const email = `${username}@beckham.local`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    if (/already been registered|already exists/i.test(error.message)) {
      return json({ error: 'Esse nome de usuário já está em uso.' }, 400);
    }
    console.error('signup: createUser falhou', error);
    return json({ error: 'Não foi possível criar a conta. Tente de novo.' }, 400);
  }

  const { error: profileError } = await admin.from('member_profiles').insert({
    id: data.user.id,
    username,
    display_name: username,
  });

  if (profileError) {
    console.error('signup: falha ao criar perfil', profileError);
    await admin.auth.admin.deleteUser(data.user.id);
    return json({ error: 'Não foi possível criar a conta. Tente de novo.' }, 400);
  }

  const { error: registroError } = await admin.from('signup_attempts').insert({ ip_hash: ipHash });
  if (registroError) console.error('signup: falha ao registrar tentativa', registroError);

  return json({ ok: true });
});
