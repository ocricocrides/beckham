import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@beckham.local`;
}

export type MemberProfile = Database['public']['Tables']['member_profiles']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type MemberProfileWithRole = MemberProfile & { roles: Role | null };
