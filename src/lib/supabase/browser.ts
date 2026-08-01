"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!env.publicSupabaseUrl || !env.publicSupabaseAnonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createBrowserClient(env.publicSupabaseUrl, env.publicSupabaseAnonKey);
}
