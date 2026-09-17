-- Registro pelo site: parte que muda o comportamento do site no ar.
-- Aplicar SÓ junto com o deploy do site e do bot (a parte aditiva já está no banco:
-- migration "registro_pelo_site", com is_member, site_registrations e enviar_registro).

-- Conta nova não ganha mais o cargo "Membro" ao ser criada: ele vem quando o bot aprova o registro.
create or replace function public.trg_assign_default_role()
returns trigger language plpgsql security definer set search_path to 'public' as $function$
declare
  v_role_id uuid;
begin
  if not new.is_member then
    return new;
  end if;
  select id into v_role_id from public.roles where name = 'Membro' limit 1;
  if v_role_id is not null then
    insert into public.member_roles (member_id, role_id)
    values (new.id, v_role_id)
    on conflict do nothing;
  end if;
  return new;
end;
$function$;

-- Perfil de quem ainda não foi aprovado some do site (só a própria pessoa e a ADM enxergam).
drop policy if exists member_profiles_select_public on public.member_profiles;
create policy member_profiles_select_public on public.member_profiles
  for select to anon, authenticated
  using (is_member or auth.uid() = id or public.is_effective_admin(auth.uid()));

-- Só membro posta no mural.
drop policy if exists wall_posts_insert_own on public.wall_posts;
create policy wall_posts_insert_own on public.wall_posts
  for insert
  with check (
    auth.uid() = member_id
    and exists (select 1 from public.member_profiles m where m.id = auth.uid() and m.is_member)
  );

-- Contagem de membros da página inicial ignora contas não aprovadas.
create or replace function public.site_home_stats()
returns json language sql stable security definer set search_path to 'public' as $function$
  with semanas as (
    select generate_series(
      date_trunc('week', now()) - interval '11 weeks',
      date_trunc('week', now()),
      interval '1 week'
    ) as semana
  ),
  acoes_finalizadas as (
    select
      date_trunc('week', to_timestamp((a.data->>'timestamp')::bigint / 1000.0)) as semana,
      case when lower(a.data->>'resultado') like 'vit%' then 'vitoria' else 'derrota' end as resultado
    from public.acoes a
    where (a.data->>'timestamp') ~ '^[0-9]+$'
      and (lower(a.data->>'resultado') like 'vit%' or lower(a.data->>'resultado') like 'derrot%')
  )
  select json_build_object(
    'membros_total', (select count(*) from public.member_profiles where is_member),
    'streamers_total', (
      select count(distinct mr.member_id) from public.member_roles mr
      join public.roles r on r.id = mr.role_id where r.is_streamer
    ),
    'acoes_total', (select count(*) from acoes_finalizadas),
    'acoes_vitorias', (select count(*) from acoes_finalizadas where resultado = 'vitoria'),
    'acoes_derrotas', (select count(*) from acoes_finalizadas where resultado = 'derrota'),
    'recrutamentos_30d', (
      select count(*) from public.discord_tickets
      where category = 'recrutamento' and created_at > now() - interval '30 days'
    ),
    'membros_por_semana', (
      select json_agg(json_build_object('semana', s.semana, 'total',
        (select count(*) from public.member_profiles m where m.is_member and date_trunc('week', m.created_at) = s.semana))
        order by s.semana)
      from semanas s
    ),
    'acoes_por_semana', (
      select json_agg(json_build_object(
        'semana', s.semana,
        'total', (select count(*) from acoes_finalizadas f where f.semana = s.semana),
        'vitorias', (select count(*) from acoes_finalizadas f where f.semana = s.semana and f.resultado = 'vitoria'),
        'derrotas', (select count(*) from acoes_finalizadas f where f.semana = s.semana and f.resultado = 'derrota')
      ) order by s.semana)
      from semanas s
    )
  );
$function$;
