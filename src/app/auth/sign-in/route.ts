import { NextResponse, type NextRequest } from "next/server";
import { logAuthDiagnostic, sanitizeAuthError, summarizePkceCookies } from "@/lib/auth/diagnostics";
import { createAuthCallbackUrl, getPostSignInPath } from "@/lib/auth/routes";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || getPostSignInPath();
  const redirectTo = createAuthCallbackUrl(requestUrl.origin, next);

  try {
    const { supabase, applyCookies, getPendingCookieNames } = createSupabaseRouteClient(request);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    const pkceCookies = summarizePkceCookies(getPendingCookieNames());

    if (error || !data.url) {
      logAuthDiagnostic("error", "google_oauth_start_failed", {
        error: sanitizeAuthError(error),
        pkceCookies,
      });

      return NextResponse.redirect(new URL("/sign-in?error=oauth_start", requestUrl.origin));
    }

    logAuthDiagnostic("info", "google_oauth_start_redirect", {
      redirectOrigin: new URL(data.url).origin,
      callbackOrigin: new URL(redirectTo).origin,
      callbackPath: new URL(redirectTo).pathname,
      pkceCookies,
    });

    return applyCookies(NextResponse.redirect(data.url));
  } catch (error) {
    logAuthDiagnostic("error", "google_oauth_start_exception", {
      error: sanitizeAuthError(error),
      pkceCookies: summarizePkceCookies(request.cookies.getAll()),
    });

    return NextResponse.redirect(new URL("/sign-in?error=oauth_start", requestUrl.origin));
  }
}
