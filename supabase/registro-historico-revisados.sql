-- Histórico de registros já decididos, pra aba Registros do painel mostrar como cada um terminou
-- e por onde foi decidido (site ou Discord).
-- Só cria uma função nova: nenhuma tabela, coluna, policy ou função existente é alterada.
-- Já aplicado no banco de produção (migration "registro_historico_revisados").
--
-- SECURITY DEFINER pelo mesmo motivo de listar_registros_pendentes: quem revisa nem sempre
-- enxerga o perfil de quem se registrou. A função devolve só os campos que a tela usa e
-- devolve vazio pra quem não pode revisar.
create or replace function public.listar_registros_revisados()
returns table (
  member_id uuid,
  id_jogo text,
  nome text,
  telefone text,
  recrutador text,
  status text,
  reviewed_at timestamptz,
  reviewed_source text,
  revisor text,
  username text,
  display_name text,
  avatar_url text
)
language sql stable security definer set search_path to 'public' as $function$
  select r.member_id, r.id_jogo, r.nome, r.telefone, r.recrutador, r.status, r.reviewed_at,
         -- Revisão antiga (antes de existir reviewed_source) que tem reviewed_by_discord_id foi pelo Discord.
         coalesce(r.reviewed_source, case when r.reviewed_by_discord_id is not null then 'discord' end),
         coalesce(
           (select p.display_name from public.member_profiles p where p.id = r.reviewed_by_member_id),
           (select p.display_name from public.member_profiles p where p.discord_id = r.reviewed_by_discord_id limit 1)
         ),
         m.username, m.display_name, m.avatar_url
  from public.site_registrations r
  join public.member_profiles m on m.id = r.member_id
  where r.status in ('aprovado', 'rejeitado')
    and public.pode_revisar_registro(auth.uid())
  order by r.reviewed_at desc nulls last
  limit 30;
$function$;

revoke all on function public.listar_registros_revisados() from public, anon;
grant execute on function public.listar_registros_revisados() to authenticated;
