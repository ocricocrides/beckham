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
export type MemberProfileWithRole = MemberProfile & { roles: Role | null };
