import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Fallbacks match the values in .env.example: this is the public anon key (safe to expose
// client-side, same as it was hardcoded in the old vanilla site) — kept here so the app still
// works out of the box even where VITE_SUPABASE_* env vars haven't been configured.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tywbicthevgfmukemxwg.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d2JpY3RoZXZnZm11a2VteHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwODU2NzUsImV4cCI6MjEwNDY2MTY3NX0.Mm2rpXt-6U3kAg4WUOSHYWWlQbDAxUFgzEitn3HUXqE';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@beckham.local`;
}

export type MemberProfile = Database['public']['Tables']['member_profiles']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
/** Cargos ordenados do mais alto pro mais baixo na hierarquia (menor sort_order primeiro). */
export type MemberProfileWithRoles = MemberProfile & { roles: Role[] };

/** Select do Supabase pra trazer, junto do perfil, todos os cargos ligados via member_roles. */
export const MEMBER_ROLES_SELECT = '*, member_roles(roles(*))';

type RawProfileWithMemberRoles = MemberProfile & { member_roles: { roles: Role | null }[] | null };

/** Achata o embed aninhado do Supabase (member_roles -> roles) num array de cargos já ordenado. */
export function normalizeProfileRoles<T extends RawProfileWithMemberRoles>(
  row: T,
): MemberProfileWithRoles {
  const { member_roles, ...rest } = row;
  const roles = (member_roles ?? [])
    .map((mr) => mr.roles)
    .filter((r): r is Role => r !== null)
    .sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === 'principal' ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
  return { ...rest, roles } as MemberProfileWithRoles;
}

/**
 * Admin "de verdade": o flag manual do perfil OU algum cargo marcado como is_admin.
 * Espelha o mesmo OR que a policy is_effective_admin() faz no banco (ver migração
 * add_role_types_and_permissions) — se mudar um lado, muda o outro.
 */
export function isEffectiveAdmin(profile: MemberProfileWithRoles | null): boolean {
  return !!profile?.is_admin || !!profile?.roles.some((r) => r.is_admin);
}

/**
 * Pode aprovar/rejeitar registro pelo site: o flag do perfil OU algum cargo com a permissão,
 * e admin sempre pode. Espelha pode_revisar_registro() no banco (ver migração
 * aprovar_registro_pelo_site) — quem manda de verdade é a função lá, essa aqui só decide o
 * que aparece na tela.
 */
export function canReviewRegistrations(profile: MemberProfileWithRoles | null): boolean {
  return (
    isEffectiveAdmin(profile) ||
    !!profile?.can_review_registrations ||
    !!profile?.roles.some((r) => r.can_review_registrations)
  );
}
