/**
 * Client-side accounts (local browser) + guest mode.
 * Passwords are hashed with PBKDF2; data is namespaced per user in localStorage.
 */

import { clearGuestStoragePrefix, migrateLegacyStorageToUser } from "./sanctuaryStorage";
import {
  clearSessionMarkers,
  readSession,
  setGuestSession,
  setUserSession,
  type Session,
} from "./sessionStore";

const ACCOUNTS_KEY = "sanctuary_accounts_v1";
const DEV_BYPASS_KEY = "sanctuary_dev_bypass";

export const SANCTUARY_PROFILE_CHANGED = "sanctuary-profile-changed";

export type SessionUser = { id: string; email: string; isGuest: boolean };

export type PublicProfile = {
  kind: "user" | "guest" | "dev";
  userId?: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarDataUrl: string | null;
  subtitle: string;
  canEdit: boolean;
};

type StoredAccount = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarDataUrl: string | null;
  saltB64: string;
  hashB64: string;
  createdAt: number;
};

function parseAccount(x: unknown): StoredAccount | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id) return null;
  if (typeof o.email !== "string" || !o.email) return null;
  if (typeof o.saltB64 !== "string" || typeof o.hashB64 !== "string") return null;
  const createdAt = typeof o.createdAt === "number" ? o.createdAt : Date.now();
  const firstName = typeof o.firstName === "string" ? o.firstName : "";
  const lastName = typeof o.lastName === "string" ? o.lastName : "";
  let avatarDataUrl: string | null = null;
  if (typeof o.avatarDataUrl === "string" && o.avatarDataUrl.startsWith("data:image/")) {
    avatarDataUrl = o.avatarDataUrl;
  }
  return {
    id: o.id,
    email: o.email,
    firstName,
    lastName,
    avatarDataUrl,
    saltB64: o.saltB64,
    hashB64: o.hashB64,
    createdAt,
  };
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.map(parseAccount).filter((x): x is StoredAccount => x != null);
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

function notifyProfileChanged(): void {
  try {
    window.dispatchEvent(new Event(SANCTUARY_PROFILE_CHANGED));
  } catch {
    /* ignore */
  }
}

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hashPassword(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function displayNameFromAccount(acc: StoredAccount, email: string): string {
  const n = [acc.firstName.trim(), acc.lastName.trim()].filter(Boolean).join(" ");
  if (n) return n;
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email || "Member";
}

export type AuthResult = { ok: true } | { ok: false; error: string };

/** True in dev or when `VITE_ENABLE_AUTH_BYPASS=true` — optional “instant access” for previews. */
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

export function setDevBypass(): void {
  try {
    localStorage.setItem(DEV_BYPASS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearDevBypass(): void {
  try {
    localStorage.removeItem(DEV_BYPASS_KEY);
  } catch {
    /* ignore */
  }
}

function sessionToUser(s: Session): SessionUser {
  if (s.mode === "guest") return { id: "guest", email: "", isGuest: true };
  return { id: s.userId, email: s.email, isGuest: false };
}

export function getSessionUser(): SessionUser | null {
  if (hasDevBypass()) return { id: "dev-bypass", email: "", isGuest: false };
  const s = readSession();
  return s ? sessionToUser(s) : null;
}

export function isAuthenticated(): boolean {
  if (hasDevBypass()) return true;
  return readSession() !== null;
}

export function getPublicProfile(): PublicProfile {
  if (hasDevBypass()) {
    return {
      kind: "dev",
      displayName: "Developer preview",
      firstName: "",
      lastName: "",
      email: "",
      avatarDataUrl: null,
      subtitle: "Local preview session",
      canEdit: false,
    };
  }
  const s = readSession();
  if (!s || s.mode === "guest") {
    return {
      kind: "guest",
      displayName: "Guest",
      firstName: "",
      lastName: "",
      email: "",
      avatarDataUrl: null,
      subtitle: "Not signed in — data won’t persist",
      canEdit: false,
    };
  }
  const acc = loadAccounts().find((a) => a.id === s.userId);
  const firstName = acc?.firstName?.trim() ?? "";
  const lastName = acc?.lastName?.trim() ?? "";
  const displayName = acc ? displayNameFromAccount(acc, s.email) : s.email.split("@")[0] || "Member";
  return {
    kind: "user",
    userId: s.userId,
    firstName,
    lastName,
    email: s.email,
    displayName,
    avatarDataUrl: acc?.avatarDataUrl ?? null,
    subtitle: "Signed in",
    canEdit: true,
  };
}

export function updateUserProfile(
  userId: string,
  patch: { firstName?: string; lastName?: string; avatarDataUrl?: string | null },
): void {
  const accounts = loadAccounts();
  const i = accounts.findIndex((a) => a.id === userId);
  if (i < 0) return;
  const cur = accounts[i]!;
  const next: StoredAccount = { ...cur };
  if (patch.firstName !== undefined) next.firstName = patch.firstName.trim();
  if (patch.lastName !== undefined) next.lastName = patch.lastName.trim();
  if (patch.avatarDataUrl !== undefined) {
    const v = patch.avatarDataUrl;
    next.avatarDataUrl =
      v && typeof v === "string" && v.startsWith("data:image/") ? v : null;
  }
  accounts[i] = next;
  saveAccounts(accounts);
  notifyProfileChanged();
}

export async function signUp(
  emailRaw: string,
  password: string,
  firstNameRaw: string,
  lastNameRaw: string,
): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const firstName = firstNameRaw.trim();
  const lastName = lastNameRaw.trim();
  if (!firstName) return { ok: false, error: "First name is required." };
  if (!lastName) return { ok: false, error: "Last name is required." };

  const accounts = loadAccounts();
  if (accounts.some((a) => a.email === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);
  const id = crypto.randomUUID();
  accounts.push({
    id,
    email,
    firstName,
    lastName,
    avatarDataUrl: null,
    saltB64: toB64(salt.buffer),
    hashB64: toB64(hash),
    createdAt: Date.now(),
  });
  saveAccounts(accounts);

  if (accounts.length === 1) migrateLegacyStorageToUser(id);

  clearGuestStoragePrefix();
  setUserSession(id, email, true);
  notifyProfileChanged();
  return { ok: true };
}

export async function signIn(
  emailRaw: string,
  password: string,
  remember: boolean,
): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  const accounts = loadAccounts();
  const acc = accounts.find((a) => a.email === email);
  if (!acc) return { ok: false, error: "No account found for that email." };

  const salt = fromB64(acc.saltB64);
  const hash = await hashPassword(password, salt);
  if (toB64(hash) !== acc.hashB64) return { ok: false, error: "Incorrect password." };

  clearGuestStoragePrefix();
  setUserSession(acc.id, acc.email, remember);
  notifyProfileChanged();
  return { ok: true };
}

export function continueAsGuest(): void {
  clearDevBypass();
  setGuestSession();
  notifyProfileChanged();
}

export function signOut(): void {
  const s = readSession();
  clearDevBypass();
  clearSessionMarkers();
  if (s?.mode === "guest") clearGuestStoragePrefix();
  notifyProfileChanged();
}

/** Dev / preview escape hatch: same storage as a signed-in user without an account row. */
export function signInDevBypass(): void {
  clearSessionMarkers();
  clearGuestStoragePrefix();
  setDevBypass();
  notifyProfileChanged();
}
