const protectedPrefixes = ["/account", "/dashboard", "/onboarding"];
const authOnlyPrefixes = ["/sign-in"];

export function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthOnlyPath(pathname: string): boolean {
  return authOnlyPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getPostSignInPath(): string {
  return "/onboarding";
}

export function createAuthCallbackUrl(origin: string, next: string): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}
