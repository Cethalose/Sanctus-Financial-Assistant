import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";
import { env } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createSupabaseRouteClient(request: NextRequest) {
  if (!env.publicSupabaseUrl || !env.publicSupabaseAnonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient(env.publicSupabaseUrl, env.publicSupabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookies) {
        cookiesToSet.push(...nextCookies);
      },
    },
  });

  return {
    supabase,
    applyCookies(response: NextResponse) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    },
    getPendingCookieNames() {
      return cookiesToSet.map((cookie) => ({ name: cookie.name }));
    },
  };
}
