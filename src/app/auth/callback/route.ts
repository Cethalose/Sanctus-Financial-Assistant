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
      const sanitizedError = sanitizeAuthError(error);
      logAuthDiagnostic("error", "google_oauth_code_exchange_failed", {
        error: sanitizedError,
        hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
        requestPkceCookies,
        responsePkceCookies: summarizePkceCookies(getPendingCookieNames()),
      });

      const response = applyCookies(
        NextResponse.redirect(
          createAuthCallbackErrorUrl(requestUrl.origin, "exchange", sanitizedError, {
            hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
            requestPkceCookieCount: requestPkceCookies.pkceCookieCount,
          }),
        ),
      );
      response.cookies.delete(pkceFlowIdCookieName);
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureProfile(user, supabase);
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
    const sanitizedError = sanitizeAuthError(error);
    logAuthDiagnostic("error", "google_oauth_callback_exception", {
      error: sanitizedError,
      hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
      requestPkceCookies,
    });

    return NextResponse.redirect(
      createAuthCallbackErrorUrl(requestUrl.origin, "exception", sanitizedError, {
        hasFlowIdCookie: hasPkceFlowIdCookie(flowId),
        requestPkceCookieCount: requestPkceCookies.pkceCookieCount,
      }),
    );
  }
}

function createAuthCallbackErrorUrl(
  origin: string,
  stage: "exchange" | "exception",
  error: ReturnType<typeof sanitizeAuthError>,
  context: {
    hasFlowIdCookie: boolean;
    requestPkceCookieCount: number;
  },
) {
  const url = new URL("/sign-in", origin);
  url.searchParams.set("error", "auth_callback");
  url.searchParams.set("auth_error_stage", stage);
  url.searchParams.set("auth_error_name", error.name);
  url.searchParams.set("auth_error_message", error.message.slice(0, 240));

  if (error.code) {
    url.searchParams.set("auth_error_code", error.code);
  }

  if (error.status !== null) {
    url.searchParams.set("auth_error_status", String(error.status));
  }

  url.searchParams.set("has_flow_id_cookie", String(context.hasFlowIdCookie));
  url.searchParams.set("pkce_cookie_count", String(context.requestPkceCookieCount));
  return url;
}
