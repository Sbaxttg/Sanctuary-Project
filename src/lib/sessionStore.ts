export const SESSION_KEY = "sanctuary_session_v1";

export type Session =
  | { v: 1; mode: "guest" }
  | { v: 1; mode: "user"; userId: string; email: string };

function parse(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (o?.v !== 1) return null;
    if (o.mode === "guest") return { v: 1, mode: "guest" };
    if (o.mode === "user" && typeof o.userId === "string" && typeof o.email === "string") {
      return { v: 1, mode: "user", userId: o.userId, email: o.email };
    }
    return null;
  } catch {
    return null;
  }
}

export function readSession(): Session | null {
  try {
    const a = parse(sessionStorage.getItem(SESSION_KEY));
    if (a) return a;
    return parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function setGuestSession(): void {
  clearSessionMarkers();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ v: 1, mode: "guest" } satisfies Session));
}

export function setUserSession(userId: string, email: string, remember: boolean): void {
  clearSessionMarkers();
  const payload = JSON.stringify({ v: 1, mode: "user", userId, email } satisfies Session);
  if (remember) localStorage.setItem(SESSION_KEY, payload);
  else sessionStorage.setItem(SESSION_KEY, payload);
}

export function clearSessionMarkers(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
