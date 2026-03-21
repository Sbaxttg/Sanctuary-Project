/**
 * Auth helpers — dev bypass now; swap in real session (Supabase, Auth0, etc.) later.
 */

const DEV_BYPASS_KEY = "sanctuary_dev_bypass";

/** True while building the site: show “skip sign-in” and allow /home without a real account. */
export function isAuthBypassFeatureEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_ENABLE_AUTH_BYPASS === "true";
}

export function hasDevBypass(): boolean {
  try {
    return localStorage.getItem(DEV_BYPASS_KEY) === "1";
  } catch {
    return false;
  }
}

/** Mark session as “signed in” for development (no backend). */
export function setDevBypass(): void {
  try {
    localStorage.setItem(DEV_BYPASS_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearDevBypass(): void {
  try {
    localStorage.removeItem(DEV_BYPASS_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * TODO: replace with real user from your auth provider.
 * Return null when not signed in.
 */
export function getSessionUser(): { id: string; email?: string } | null {
  return null;
}

export function isAuthenticated(): boolean {
  if (hasDevBypass()) return true;
  return getSessionUser() !== null;
}
