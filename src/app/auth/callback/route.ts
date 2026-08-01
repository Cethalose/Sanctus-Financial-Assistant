import { NextResponse, type NextRequest } from "next/server";
import { logAuthDiagnostic, sanitizeAuthError, summarizePkceCookies } from "@/lib/auth/diagnostics";
import { hasPkceFlowIdCookie, pkceFlowIdCookieName, sanitizePkceFlowId } from "@/lib/auth/pkce-flow";
import { ensureProfile } from "@/lib/auth/profile";
import { getPostSignInPath } from "@/lib/auth/routes";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || getPostSignInPath();
  const requestPkceCookies = summarizePkceCookies(request.cookies.getAll());
  const flowId = sanitizePkceFlowId(request.cookies.get(pkceFlowIdCookieName)?.value);

  if (!code) {
    logAuthDiagnostic("warn", "google_oauth_callback_missing_code", {
      callbackOrigin: requestUrl.origin,
      callbackPath: requestUrl.pathname,
      hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
      requestPkceCookies,
    });

    return NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin));
  }

  try {
    const { supabase, applyCookies, getPendingCookieNames } = createSupabaseRouteClient(request);
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (error) {
      logAuthDiagnostic("error", "google_oauth_code_exchange_failed", {
        error: sanitizeAuthError(error),
        hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
        requestPkceCookies,
        responsePkceCookies: summarizePkceCookies(getPendingCookieNames()),
      });

      const response = applyCookies(
        NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin)),
      );
      response.cookies.delete(pkceFlowIdCookieName);
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureProfile(user);
    }

    logAuthDiagnostic("info", "google_oauth_callback_succeeded", {
      hasUser: Boolean(user),
      hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
      requestPkceCookies,
      responsePkceCookies: summarizePkceCookies(getPendingCookieNames()),
    });

    const response = applyCookies(NextResponse.redirect(new URL(next, requestUrl.origin)));
    response.cookies.delete(pkceFlowIdCookieName);
    return response;
  } catch (error) {
    logAuthDiagnostic("error", "google_oauth_callback_exception", {
      error: sanitizeAuthError(error),
      hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
      requestPkceCookies,
    });

    return NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin));
  }
}
