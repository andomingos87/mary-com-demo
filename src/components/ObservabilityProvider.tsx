'use client';

/**
 * ObservabilityProvider - wrapper for future client-side observability (e.g. error boundary, analytics).
 * Audit logging is server-side only; do not call logAuditEvent or trackPageView from the client.
 */
export function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

