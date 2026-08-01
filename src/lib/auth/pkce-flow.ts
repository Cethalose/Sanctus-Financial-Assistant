export const pkceFlowIdCookieName = "sanctus-supabase-pkce-flow-id";

const pkceFlowIdPattern = /^[A-Za-z0-9_-]{8,64}$/;

export function sanitizePkceFlowId(flowId: string | null | undefined): string | null {
  return flowId && pkceFlowIdPattern.test(flowId) ? flowId : null;
}

export function hasPkceFlowIdCookie(flowId: string | null | undefined): boolean {
  return Boolean(sanitizePkceFlowId(flowId));
}
