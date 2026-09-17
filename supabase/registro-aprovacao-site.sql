-- Aprovar registro pelo site, além do Discord.
-- Tudo aditivo: nenhuma coluna, policy ou função existente é apagada ou alterada.
--
-- Desenho: o site NÃO libera o membro sozinho. Ele só marca o pedido como aprovado/rejeitado
-- e o bot faz o resto (cargo no Discord, apelido, cargo do site, is_member, DM). Assim aprovar
-- pelo site e aprovar pelo Discord passam exatamente pelo mesmo caminho, sem duplicar regra.

-- ==== 1) Permissão nova, no mesmo padrão de can_post_photos / can_delete_announcements ====
alter table public.member_profiles add column if not exists can_review_registrations boolean not null default false;
alter table public.roles           add column if not exists can_review_registrations boolean not null default false;

create or replace function public.can_review_registrations(p_uid uuid)
returns boolean language sql stable security definer set search_path to 'public' as $function$
  select coalesce((select can_review_registrations from public.member_profiles where id = p_uid), false)
    or exists (
      select 1 from public.member_roles mr join public.roles r on r.id = mr.role_id
      where mr.member_id = p_uid and r.can_review_registrations
    );
$function$;

-- Quem revisa (admin ou permissão) é decidido sempre por esse OR.
create or replace function public.pode_revisar_registro(p_uid uuid)
returns boolean language sql stable security definer set search_path to 'public' as $function$
  select public.is_effective_admin(p_uid) or public.can_review_registrations(p_uid);
$function$;

-- ==== 2) Colunas de controle do pedido ====
-- reviewed_by_member_id: quem aprovou pelo site (reviewed_by_discord_id continua pro Discord)
-- reviewed_source      : 'site' ou 'discord', só pra saber de onde veio
-- discord_applied_at   : o bot já aplicou o lado do Discord (cargo/apelido/DM). Sem isso o bot
--                        não saberia diferenciar "aprovado agora no site" de "já resolvido"
-- discord_messages     : onde a mensagem de aprovação foi postada, pra editar ela depois
alter table public.site_registrations
  add column if not exists reviewed_by_member_id uuid references public.member_profiles(id) on delete set null,
  add column if not exists reviewed_source text,
  add column if not exists discord_applied_at timestamptz,
  add column if not exists discord_messages jsonb;

-- Reenvio de registro (enviar_registro faz on conflict ... set status='pendente') tem que zerar
-- o controle acima, senão o pedido novo nasce parecendo já resolvido. Feito por trigger pra não
-- precisar reescrever enviar_registro.
create or replace function public.trg_limpar_controle_registro()
returns trigger language plpgsql security definer set search_path to 'public' as $function$
begin
  if new.status = 'pendente' and old.status is distinct from 'pendente' then
    new.reviewed_by_member_id := null;
    new.reviewed_source := null;
    new.discord_applied_at := null;
    new.discord_messages := null;
  end if;
  return new;
end;
$function$;

drop trigger if exists limpar_controle_registro on public.site_registrations;
create trigger limpar_controle_registro
  before update on public.site_registrations
  for each row execute function public.trg_limpar_controle_registro();

-- ==== 3) Quem revisa precisa enxergar os pedidos ====
-- Policy NOVA e separada: as policies são OR, então a antiga (dono + admin) fica intacta.
drop policy if exists site_registrations_select_revisor on public.site_registrations;
create policy site_registrations_select_revisor on public.site_registrations
  for select to authenticated
  using (public.can_review_registrations(auth.uid()));

-- ==== 4) Listar pendentes com o perfil junto ====
-- Precisa ser SECURITY DEFINER: quem está pendente ainda não é is_member, então o perfil dele
-- fica escondido pela policy de member_profiles pra quem não é admin. Em vez de afrouxar aquela
-- policy, essa função devolve só os campos que a tela usa.
create or replace function public.listar_registros_pendentes()
returns table (
  member_id uuid,
  discord_id text,
  id_jogo text,
  nome text,
  telefone text,
  recrutador text,
  submitted_at timestamptz,
  posted_at timestamptz,
  username text,
  display_name text,
  avatar_url text
)
language sql stable security definer set search_path to 'public' as $function$
  select r.member_id, r.discord_id, r.id_jogo, r.nome, r.telefone, r.recrutador,
         r.submitted_at, r.posted_at, m.username, m.display_name, m.avatar_url
  from public.site_registrations r
  join public.member_profiles m on m.id = r.member_id
  where r.status = 'pendente'
    and public.pode_revisar_registro(auth.uid())
  order by r.submitted_at;
$function$;

revoke all on function public.listar_registros_pendentes() from public, anon;
grant execute on function public.listar_registros_pendentes() to authenticated;

-- ==== 5) Aprovar/rejeitar ====
-- Só marca o pedido. Não mexe em is_member nem em cargo: isso é do bot, pra não existirem duas
-- regras de "o que aprovar significa". Nenhuma policy de UPDATE é criada em site_registrations,
-- então a única forma de escrever ali pelo site é passando por esta função.
create or replace function public.revisar_registro(p_member_id uuid, p_aprovado boolean)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare
  v_uid uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then raise exception 'Entre na sua conta primeiro.'; end if;
  if not public.pode_revisar_registro(v_uid) then
    raise exception 'Você não tem permissão para revisar registros.';
  end if;
  if p_member_id = v_uid then
    raise exception 'Você não pode revisar o seu próprio registro.';
  end if;

  select status into v_status from public.site_registrations where member_id = p_member_id for update;
  if not found then raise exception 'Esse registro não existe.'; end if;
  if v_status <> 'pendente' then raise exception 'Esse registro já foi revisado.'; end if;

  update public.site_registrations set
    status = case when p_aprovado then 'aprovado' else 'rejeitado' end,
    reviewed_at = now(),
    reviewed_by_member_id = v_uid,
    reviewed_source = 'site'
  where member_id = p_member_id;
end;
$function$;

revoke all on function public.revisar_registro(uuid, boolean) from public, anon;
grant execute on function public.revisar_registro(uuid, boolean) to authenticated;

-- ==== 6) Fechar o que não precisa ficar aberto ====
-- can_review_registrations fica igual às irmãs (can_post_photos etc.): authenticated PRECISA
-- poder executar, porque a policy de select acima chama ela e policy roda com o papel de quem
-- consulta. Só anon é que não tem nada que fazer aqui.
revoke execute on function public.can_review_registrations(uuid) from anon;

-- pode_revisar_registro só é chamada de dentro das funções SECURITY DEFINER acima, que rodam
-- como dono. Ninguém precisa chamar ela pela API.
revoke execute on function public.pode_revisar_registro(uuid) from anon, authenticated;

-- Função de trigger não é pra ser chamada por RPC.
revoke execute on function public.trg_limpar_controle_registro() from anon, authenticated;
