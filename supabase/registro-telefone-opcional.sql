-- Telefone deixa de ser obrigatório no registro pelo site.
-- Mesma função de antes, só muda a regra do telefone: vazio passa; se vier preenchido, continua
-- precisando ter de 8 a 20 dígitos. A coluna continua NOT NULL e o vazio é gravado como ''.
--
-- As regex usam [0-9] no lugar de \d/\D: mesmo resultado, sem barra invertida pra escapar.
-- A assinatura não muda, então o create or replace mantém as permissões (só authenticated executa).
create or replace function public.enviar_registro(p_id_jogo text, p_nome text, p_telefone text, p_recrutador text)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare
  v_uid uuid := auth.uid();
  v_perfil public.member_profiles%rowtype;
  v_status text;
  v_id_jogo text := trim(coalesce(p_id_jogo, ''));
  v_nome text := trim(coalesce(p_nome, ''));
  v_telefone text := regexp_replace(coalesce(p_telefone, ''), '[^0-9]', '', 'g');
  v_recrutador text := trim(coalesce(p_recrutador, ''));
begin
  if v_uid is null then raise exception 'Entre na sua conta primeiro.'; end if;
  select * into v_perfil from public.member_profiles where id = v_uid;
  if not found then raise exception 'Perfil não encontrado.'; end if;
  if v_perfil.is_member then raise exception 'Você já é membro.'; end if;
  if v_perfil.discord_id is null then raise exception 'Vincule sua conta do Discord antes de enviar o registro.'; end if;

  if v_id_jogo !~ '^[0-9]{1,20}$' then raise exception 'O ID no jogo precisa ser só números.'; end if;
  if char_length(v_nome) < 2 or char_length(v_nome) > 32 then raise exception 'Nome do membro precisa ter entre 2 e 32 caracteres.'; end if;
  if v_telefone <> '' and (char_length(v_telefone) < 8 or char_length(v_telefone) > 20) then
    raise exception 'Número de telefone inválido.';
  end if;
  if char_length(v_recrutador) < 2 or char_length(v_recrutador) > 32 then raise exception 'Nome do recrutador precisa ter entre 2 e 32 caracteres.'; end if;

  select status into v_status from public.site_registrations where member_id = v_uid;
  if v_status = 'pendente' then raise exception 'Seu registro já foi enviado e está aguardando aprovação.'; end if;

  insert into public.site_registrations (member_id, discord_id, id_jogo, nome, telefone, recrutador)
  values (v_uid, v_perfil.discord_id, v_id_jogo, v_nome, v_telefone, v_recrutador)
  on conflict (member_id) do update set
    discord_id = excluded.discord_id, id_jogo = excluded.id_jogo, nome = excluded.nome,
    telefone = excluded.telefone, recrutador = excluded.recrutador, status = 'pendente',
    submitted_at = now(), posted_at = null, reviewed_at = null, reviewed_by_discord_id = null;
end;
$function$;
