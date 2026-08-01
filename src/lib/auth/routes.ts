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
