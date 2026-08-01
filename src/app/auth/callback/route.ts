import { NextResponse, type NextRequest } from "next/server";
import { logAuthDiagnostic, sanitizeAuthError, summarizePkceCookies } from "@/lib/auth/diagnostics";
import { ensureProfile } from "@/lib/auth/profile";
import { getPostSignInPath } from "@/lib/auth/routes";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || getPostSignInPath();
  const requestPkceCookies = summarizePkceCookies(request.cookies.getAll());

  if (!code) {
    logAuthDiagnostic("warn", "google_oauth_callback_missing_code", {
      callbackOrigin: requestUrl.origin,
      callbackPath: requestUrl.pathname,
      requestPkceCookies,
    });

    return NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin));
  }

  try {
    const { supabase, applyCookies, getPendingCookieNames } = createSupabaseRouteClient(request);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logAuthDiagnostic("error", "google_oauth_code_exchange_failed", {
        error: sanitizeAuthError(error),
        requestPkceCookies,
        responsePkceCookies: summarizePkceCookies(getPendingCookieNames()),
      });

      return applyCookies(
        NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin)),
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureProfile(user);
    }

    logAuthDiagnostic("info", "google_oauth_callback_succeeded", {
      hasUser: Boolean(user),
      requestPkceCookies,
      responsePkceCookies: summarizePkceCookies(getPendingCookieNames()),
    });

    return applyCookies(NextResponse.redirect(new URL(next, requestUrl.origin)));
  } catch (error) {
    logAuthDiagnostic("error", "google_oauth_callback_exception", {
      error: sanitizeAuthError(error),
      requestPkceCookies,
    });

    return NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin));
  }
}
