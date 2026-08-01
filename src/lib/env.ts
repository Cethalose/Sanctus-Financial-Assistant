const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL;

export const env = {
  publicSupabaseUrl,
  publicSupabaseAnonKey,
  publicAppUrl,
  hasSupabaseConfig: Boolean(publicSupabaseUrl && publicSupabaseAnonKey)
};
