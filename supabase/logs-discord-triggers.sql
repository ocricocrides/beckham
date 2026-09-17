-- Logs do site pro Discord gerados pelo próprio banco.
-- Cada ação relevante grava uma linha em discord_action_log via trigger, então não dá pra fazer
-- a ação sem deixar rastro (antes quem mandava o log era a página, depois da ação).
-- O NovoBot continua lendo discord_action_log via Realtime e posta no canal certo.
--
-- Regras gerais:
--   * só loga ação feita por alguém logado no site (auth.uid() presente). Mudanças do bot, do
--     cron de cores e do SQL Editor usam service role e não viram log.
--   * ignora mudanças em cascata (pg_trigger_depth() > 1): ex. apagar um cargo não gera um log
--     de "tirou cargo" pra cada membro, e o cargo "Membro" automático não gera log.

alter table public.discord_action_log drop constraint if exists discord_action_log_action_check;
alter table public.discord_action_log add constraint discord_action_log_action_check check (action = any (array[
  -- conteúdo
  'post_photo', 'delete_photo', 'restore_photo',
  'post_announcement', 'delete_announcement', 'restore_announcement',
  'add_clip', 'remove_clip', 'delete_wall_post',
  -- administração
  'delete_profile', 'rename_profile', 'update_member_permissions',
  'add_member_role', 'remove_member_role',
  'create_role', 'delete_role', 'rename_role', 'update_role_permissions'
]));

-- "<@discord_id> (@username)" quando vinculado, senão "@username".
create or replace function public.discord_log_member_label(p_member_id uuid)
returns text language sql stable security definer set search_path to 'public' as $$
  select coalesce(
    (select case when discord_id is not null then '<@' || discord_id || '> (@' || username || ')'
                 else '@' || username end
       from public.member_profiles where id = p_member_id),
    'membro removido'
  );
$$;

create or replace function public.discord_log_write(p_action text, p_subject text, p_image_url text default null)
returns void language plpgsql security definer set search_path to 'public' as $$
declare
  v_actor public.member_profiles%rowtype;
begin
  if auth.uid() is null then
    return;
  end if;
  select * into v_actor from public.member_profiles where id = auth.uid();
  insert into public.discord_action_log (action, subject, actor_display_name, actor_username, actor_discord_id, image_url)
  values (p_action, left(p_subject, 500), v_actor.display_name, v_actor.username, v_actor.discord_id, p_image_url);
end;
$$;

create or replace function public.discord_log_liga(p_ligado boolean)
returns text language sql immutable as $$
  select case when p_ligado then 'ligado' else 'desligado' end;
$$;

-- Fotos e anúncios: apagar (vai pra lixeira) e restaurar.
create or replace function public.trg_discord_log_conteudo()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_tipo text := case when tg_table_name = 'crew_photos' then 'photo' else 'announcement' end;
  v_postado text := case when tg_table_name = 'crew_photos' then 'postada' else 'postado' end;
  v_quem text;
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;
  if old.deleted_at is null and new.deleted_at is not null then
    v_quem := case
      when new.posted_by_discord_id is not null then '<@' || new.posted_by_discord_id || '>'
      when new.posted_by_username is not null then '@' || new.posted_by_username
    end;
    perform public.discord_log_write('delete_' || v_tipo,
      new.title || ' (' || v_postado || coalesce(' por ' || v_quem, '') || ' em '
        || to_char(new.created_at at time zone 'America/Sao_Paulo', 'DD/MM/YYYY') || ')',
      new.image_url);
  elsif old.deleted_at is not null and new.deleted_at is null then
    perform public.discord_log_write('restore_' || v_tipo, new.title, new.image_url);
  end if;
  return new;
end;
$$;

drop trigger if exists discord_log_conteudo on public.crew_photos;
create trigger discord_log_conteudo after update of deleted_at on public.crew_photos
  for each row execute function public.trg_discord_log_conteudo();
drop trigger if exists discord_log_conteudo on public.announcements;
create trigger discord_log_conteudo after update of deleted_at on public.announcements
  for each row execute function public.trg_discord_log_conteudo();

-- Clipes em destaque.
create or replace function public.trg_discord_log_clips()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  if tg_op = 'INSERT' then
    perform public.discord_log_write('add_clip', new.title || ' <' || new.url || '>');
  else
    perform public.discord_log_write('remove_clip', old.title || ' <' || old.url || '>');
  end if;
  return null;
end;
$$;

drop trigger if exists discord_log_clips on public.featured_clips;
create trigger discord_log_clips after insert or delete on public.featured_clips
  for each row execute function public.trg_discord_log_clips();

-- Mural: só quando alguém apaga o post de OUTRA pessoa (moderação).
create or replace function public.trg_discord_log_wall()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if pg_trigger_depth() > 1 or auth.uid() is null or auth.uid() = old.member_id then
    return null;
  end if;
  perform public.discord_log_write('delete_wall_post',
    public.discord_log_member_label(old.member_id) || ': "' || old.body || '"');
  return null;
end;
$$;

drop trigger if exists discord_log_wall on public.wall_posts;
create trigger discord_log_wall after delete on public.wall_posts
  for each row execute function public.trg_discord_log_wall();

-- Cargos de um membro.
create or replace function public.trg_discord_log_member_roles()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_cargo text;
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  if tg_op = 'INSERT' then
    select name into v_cargo from public.roles where id = new.role_id;
    perform public.discord_log_write('add_member_role',
      coalesce(v_cargo, 'cargo') || ' para ' || public.discord_log_member_label(new.member_id));
  else
    -- Em cascata (cargo ou conta apagados) o cargo/membro já sumiu: o log do cargo apagado basta.
    select name into v_cargo from public.roles where id = old.role_id;
    if v_cargo is null or not exists (select 1 from public.member_profiles where id = old.member_id) then
      return null;
    end if;
    perform public.discord_log_write('remove_member_role',
      v_cargo || ' de ' || public.discord_log_member_label(old.member_id));
  end if;
  return null;
end;
$$;

drop trigger if exists discord_log_member_roles on public.member_roles;
create trigger discord_log_member_roles after insert or delete on public.member_roles
  for each row execute function public.trg_discord_log_member_roles();

-- Cargos: criar, apagar, renomear e mudar permissões.
create or replace function public.trg_discord_log_roles()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_mudancas text[] := '{}';
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;

  if tg_op = 'INSERT' then
    perform public.discord_log_write('create_role',
      new.name || ' (' || case when new.tipo = 'principal' then 'cargo principal' else 'subcargo' end
        || case when new.is_admin then ', administrador' else '' end || ')');
    return null;
  end if;

  if tg_op = 'DELETE' then
    perform public.discord_log_write('delete_role', old.name);
    return null;
  end if;

  if new.name is distinct from old.name then
    perform public.discord_log_write('rename_role', old.name || ' → ' || new.name);
  end if;

  if new.tipo is distinct from old.tipo then
    v_mudancas := v_mudancas || ('tipo: ' || case when new.tipo = 'principal' then 'principal' else 'subcargo' end);
  end if;
  if new.is_admin is distinct from old.is_admin then
    v_mudancas := v_mudancas || ('administrador ' || public.discord_log_liga(new.is_admin));
  end if;
  if new.can_post_photos is distinct from old.can_post_photos then
    v_mudancas := v_mudancas || ('postar fotos ' || public.discord_log_liga(new.can_post_photos));
  end if;
  if new.can_delete_photos is distinct from old.can_delete_photos then
    v_mudancas := v_mudancas || ('apagar fotos ' || public.discord_log_liga(new.can_delete_photos));
  end if;
  if new.can_post_announcements is distinct from old.can_post_announcements then
    v_mudancas := v_mudancas || ('postar anúncios ' || public.discord_log_liga(new.can_post_announcements));
  end if;
  if new.can_delete_announcements is distinct from old.can_delete_announcements then
    v_mudancas := v_mudancas || ('apagar anúncios ' || public.discord_log_liga(new.can_delete_announcements));
  end if;

  if array_length(v_mudancas, 1) > 0 then
    perform public.discord_log_write('update_role_permissions', new.name || ': ' || array_to_string(v_mudancas, ', '));
  end if;
  return null;
end;
$$;

drop trigger if exists discord_log_roles on public.roles;
create trigger discord_log_roles after insert or update or delete on public.roles
  for each row execute function public.trg_discord_log_roles();

-- Perfil de membro: renomeado por outra pessoa e permissões individuais.
create or replace function public.trg_discord_log_member_profiles()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_mudancas text[] := '{}';
begin
  if pg_trigger_depth() > 1 or auth.uid() is null then
    return null;
  end if;

  if new.display_name is distinct from old.display_name and auth.uid() <> new.id then
    perform public.discord_log_write('rename_profile',
      public.discord_log_member_label(new.id) || ': ' || coalesce(old.display_name, '(sem nome)') || ' → ' || coalesce(new.display_name, '(sem nome)'));
  end if;

  if new.is_admin is distinct from old.is_admin then
    v_mudancas := v_mudancas || ('administrador ' || public.discord_log_liga(new.is_admin));
  end if;
  if new.can_post_photos is distinct from old.can_post_photos then
    v_mudancas := v_mudancas || ('postar fotos ' || public.discord_log_liga(new.can_post_photos));
  end if;
  if new.can_delete_photos is distinct from old.can_delete_photos then
    v_mudancas := v_mudancas || ('apagar fotos ' || public.discord_log_liga(new.can_delete_photos));
  end if;
  if new.can_post_announcements is distinct from old.can_post_announcements then
    v_mudancas := v_mudancas || ('postar anúncios ' || public.discord_log_liga(new.can_post_announcements));
  end if;
  if new.can_delete_announcements is distinct from old.can_delete_announcements then
    v_mudancas := v_mudancas || ('apagar anúncios ' || public.discord_log_liga(new.can_delete_announcements));
  end if;

  if array_length(v_mudancas, 1) > 0 then
    perform public.discord_log_write('update_member_permissions',
      public.discord_log_member_label(new.id) || ': ' || array_to_string(v_mudancas, ', '));
  end if;
  return null;
end;
$$;

drop trigger if exists discord_log_member_profiles on public.member_profiles;
create trigger discord_log_member_profiles after update on public.member_profiles
  for each row execute function public.trg_discord_log_member_profiles();

-- Nada disso é chamável pela API (anon/authenticated); só roda dentro dos triggers.
revoke execute on function public.discord_log_member_label(uuid) from public, anon, authenticated;
revoke execute on function public.discord_log_write(text, text, text) from public, anon, authenticated;
revoke execute on function public.discord_log_liga(boolean) from public, anon, authenticated;
revoke execute on function public.trg_discord_log_conteudo() from public, anon, authenticated;
revoke execute on function public.trg_discord_log_clips() from public, anon, authenticated;
revoke execute on function public.trg_discord_log_wall() from public, anon, authenticated;
revoke execute on function public.trg_discord_log_member_roles() from public, anon, authenticated;
revoke execute on function public.trg_discord_log_roles() from public, anon, authenticated;
revoke execute on function public.trg_discord_log_member_profiles() from public, anon, authenticated;
