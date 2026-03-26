/**
 * Routes reads/writes to the correct Web Storage for the active session:
 * - Signed-in user: localStorage keys `baseKey::__user_<id>` (persists across logouts)
 * - Guest: sessionStorage keys `sanctuary_guest__<baseKey>` (cleared on sign out / tab session)
 */

import { readSession } from "./sessionStore";

const GUEST_KEY_PREFIX = "sanctuary_guest__";
const DEV_BYPASS_KEY = "sanctuary_dev_bypass";

function isDevBypass(): boolean {
  try {
    return localStorage.getItem(DEV_BYPASS_KEY) === "1";
  } catch {
    return false;
  }
}

function fullKey(baseKey: string): string | null {
  if (isDevBypass()) return baseKey;
  const session = readSession();
  if (!session) return null;
  if (session.mode === "guest") return `${GUEST_KEY_PREFIX}${baseKey}`;
  return `${baseKey}::__user_${session.userId}`;
}

function store(): Storage | null {
  if (isDevBypass()) return localStorage;
  const session = readSession();
  if (!session) return null;
  return session.mode === "guest" ? sessionStorage : localStorage;
}

export function storageGet(baseKey: string): string | null {
  try {
    const k = fullKey(baseKey);
    const s = store();
    if (!k || !s) return null;
    return s.getItem(k);
  } catch {
    return null;
  }
}

export function storageSet(baseKey: string, value: string): void {
  try {
    const k = fullKey(baseKey);
    const s = store();
    if (!k || !s) return;
    s.setItem(k, value);
  } catch {
    /* quota / private mode */
  }
}

export function storageRemove(baseKey: string): void {
  try {
    const k = fullKey(baseKey);
    const s = store();
    if (!k || !s) return;
    s.removeItem(k);
  } catch {
    /* ignore */
  }
}

/** Remove all guest-scoped rows from sessionStorage (call on guest sign-out). */
export function clearGuestStoragePrefix(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(GUEST_KEY_PREFIX)) keys.push(k);
    }
    for (const k of keys) sessionStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

const LEGACY_KEYS = [
  "sanctuary-notes-v2",
  "sanctuary-calendar-events-v1",
  "sanctuary-calendar-tasks-v1",
  "sanctuary-calendar-milestones-v2",
  "sanctuary-calendar-milestone-v1",
  "sanctuary-calendar-collab-v1",
  "sanctuary-fitness-goals-v1",
  "sanctuary-fitness-weight-series-v1",
  "sanctuary-fitness-exercises-v1",
  "sanctuary-fitness-hydration-v1",
  "sanctuary-fitness-calories-v1",
  "sanctuary-fitness-last-session-seconds-v1",
  "sanctuary-weather-last-city",
] as const;

/** Copy pre-auth localStorage data into the first new account (one-time). */
export function migrateLegacyStorageToUser(userId: string): void {
  try {
    const flag = "sanctuary_legacy_migrated_v1";
    if (localStorage.getItem(flag) === "1") return;
    let any = false;
    for (const base of LEGACY_KEYS) {
      const legacy = localStorage.getItem(base);
      if (legacy == null) continue;
      const namespaced = `${base}::__user_${userId}`;
      if (localStorage.getItem(namespaced) == null) {
        localStorage.setItem(namespaced, legacy);
        any = true;
      }
    }
    if (any) localStorage.setItem(flag, "1");
  } catch {
    /* ignore */
  }
}
