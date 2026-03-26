export type WorkspaceTab = "notes" | "projects";

export type Folder = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  folderId: string | null;
  workspace: WorkspaceTab;
  title: string;
  bodyHtml: string;
  tags: string[];
  updatedAt: number;
};

export type NotesState = {
  folders: Folder[];
  notes: Note[];
};

import { storageGet, storageSet } from "./sanctuaryStorage";

const STORAGE_KEY = "sanctuary-notes-v2";

function uid(): string {
  return crypto.randomUUID();
}

export function createEmptyState(): NotesState {
  return { folders: [], notes: [] };
}

export function loadNotesState(): NotesState {
  try {
    const raw = storageGet(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as NotesState;
    if (!parsed || !Array.isArray(parsed.folders) || !Array.isArray(parsed.notes)) {
      return createEmptyState();
    }
    return parsed;
  } catch {
    return createEmptyState();
  }
}

export function saveNotesState(state: NotesState): void {
  storageSet(STORAGE_KEY, JSON.stringify(state));
}

export function newFolder(name: string): Folder {
  return { id: uid(), name: name.trim() || "Untitled folder" };
}

export function newNote(partial: {
  folderId: string | null;
  workspace: WorkspaceTab;
}): Note {
  const now = Date.now();
  return {
    id: uid(),
    folderId: partial.folderId,
    workspace: partial.workspace,
    title: "Untitled Note",
    bodyHtml: "",
    tags: [],
    updatedAt: now,
  };
}

export function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}

export function formatRelativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
