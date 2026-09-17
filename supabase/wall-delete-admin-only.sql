-- Mural: só administradores apagam recados (antes o próprio autor também podia).
-- Aplicado em 2026-09-17 como migration wall_posts_delete_admin_only.
drop policy if exists wall_posts_delete_own_or_admin on public.wall_posts;
create policy wall_posts_delete_admin_only on public.wall_posts
  for delete using (public.is_effective_admin(auth.uid()));
