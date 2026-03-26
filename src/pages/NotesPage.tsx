import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { useRegisterAISanctuary } from "../context/AISanctuaryContext";
import { NotesEditorToolbar } from "../components/notes/NotesEditorToolbar";
import {
  formatRelativeTime,
  loadNotesState,
  newFolder,
  newNote,
  saveNotesState,
  stripHtml,
  type Note,
  type WorkspaceTab,
} from "../lib/notesStorage";

function FolderIcon() {
  return (
    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

export function NotesPage() {
  const [data, setData] = useState(loadNotesState);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("notes");
  const [selectedFolderId, setSelectedFolderId] = useState<string | "all">("all");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderDraft, setFolderDraft] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef(data.notes);
  notesRef.current = data.notes;

  useEffect(() => {
    saveNotesState(data);
  }, [data]);

  useEffect(() => {
    document.title = "The Sanctuary — Notes";
  }, []);

  const filteredNotes = useMemo(() => {
    let list = data.notes.filter((n) => n.workspace === workspaceTab);
    if (selectedFolderId !== "all") {
      list = list.filter((n) => n.folderId === selectedFolderId);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((n) => {
        const blob = `${n.title} ${stripHtml(n.bodyHtml)} ${n.tags.join(" ")}`.toLowerCase();
        return blob.includes(q);
      });
    }
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [data.notes, workspaceTab, selectedFolderId, search]);

  useEffect(() => {
    if (filteredNotes.length === 0) {
      setSelectedNoteId(null);
      return;
    }
    setSelectedNoteId((prev) => {
      if (prev && filteredNotes.some((n) => n.id === prev)) return prev;
      return filteredNotes[0].id;
    });
  }, [filteredNotes]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!selectedNoteId) {
      editorRef.current.innerHTML = "";
      return;
    }
    const n = notesRef.current.find((x) => x.id === selectedNoteId);
    if (n) editorRef.current.innerHTML = n.bodyHtml || "";
  }, [selectedNoteId]);

  const selectedNote = useMemo(
    () => data.notes.find((n) => n.id === selectedNoteId) ?? null,
    [data.notes, selectedNoteId],
  );

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setData((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    }));
  }, []);

  const deleteNote = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
    setSelectedNoteId((cur) => (cur === id ? null : cur));
  }, []);

  const handleNewNote = () => {
    const note = newNote({
      folderId: selectedFolderId === "all" ? null : selectedFolderId,
      workspace: workspaceTab,
    });
    setData((d) => ({ ...d, notes: [note, ...d.notes] }));
    setSelectedNoteId(note.id);
    window.setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const handleAddFolder = () => {
    const name = folderDraft.trim();
    if (!name) {
      setAddingFolder(false);
      return;
    }
    const folder = newFolder(name);
    setData((d) => ({ ...d, folders: [...d.folders, folder] }));
    setFolderDraft("");
    setAddingFolder(false);
    setSelectedFolderId(folder.id);
  };

  const handleEditorInput = () => {
    if (!selectedNoteId || !editorRef.current) return;
    updateNote(selectedNoteId, { bodyHtml: editorRef.current.innerHTML });
  };

  const handleAppendTag = useCallback(
    (tag: string) => {
      if (!selectedNoteId) return;
      const note = data.notes.find((n) => n.id === selectedNoteId);
      if (!note) return;
      const normalized = tag.startsWith("#") ? tag : `#${tag}`;
      if (note.tags.includes(normalized)) return;
      updateNote(selectedNoteId, { tags: [...note.tags, normalized] });
    },
    [selectedNoteId, data.notes, updateNote],
  );

  const charCount = selectedNote ? stripHtml(selectedNote.bodyHtml).length + selectedNote.title.length : 0;

  const notesAiContext = useMemo(() => {
    const n = selectedNote;
    if (!n) return `Notes workspace (${workspaceTab}). No note selected. Total notes in workspace: ${data.notes.filter((x) => x.workspace === workspaceTab).length}.`;
    const plain = stripHtml(n.bodyHtml).slice(0, 8000);
    return `Open note: "${n.title}" (id ${n.id}). Tags: ${n.tags.join(", ") || "none"}.\nBody (plain text excerpt):\n${plain}`;
  }, [selectedNote, workspaceTab, data.notes]);

  const notesToolHandlers = useMemo(
    () => ({
      search_notes: (args: Record<string, unknown>) => {
        const q = String(args.query ?? "").trim().toLowerCase();
        if (!q) return "Provide a search query.";
        const matches = data.notes
          .filter((n) => {
            const blob = `${n.title} ${stripHtml(n.bodyHtml)} ${n.tags.join(" ")}`.toLowerCase();
            return blob.includes(q);
          })
          .slice(0, 10);
        if (!matches.length) return "No notes matched that query.";
        return matches
          .map(
            (n) =>
              `• **${n.title}** (${n.workspace}) — ${stripHtml(n.bodyHtml).slice(0, 140)}${stripHtml(n.bodyHtml).length > 140 ? "…" : ""}`,
          )
          .join("\n");
      },
      notes_add_tag: (args: Record<string, unknown>) => {
        const tag = String(args.tag ?? "").trim();
        if (!tag) return "No tag provided.";
        if (!selectedNoteId) return "No note is selected.";
        handleAppendTag(tag);
        return `Added tag "${tag.startsWith("#") ? tag : `#${tag}`}" to the open note.`;
      },
    }),
    [data.notes, selectedNoteId, handleAppendTag],
  );

  const notesAiReg = useMemo(
    () => ({
      route: "/notes",
      label: "Notes Sanctuary",
      contextText: notesAiContext,
      toolHandlers: notesToolHandlers,
    }),
    [notesAiContext, notesToolHandlers],
  );
  useRegisterAISanctuary(notesAiReg);

  const tabBtn = (active: boolean) =>
    active
      ? "flex-1 rounded-lg bg-[#151a21]/90 py-2.5 text-center text-[13px] font-bold text-[#f1f3fc] ring-1 ring-[#2962FF]/40"
      : "flex-1 rounded-lg py-2.5 text-center text-[13px] font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300";

  return (
    <div className="min-h-screen bg-[#0a0e14] font-manrope text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        {/* Column 2 — Notes sidebar */}
        <aside className="sticky top-0 flex h-screen w-80 shrink-0 flex-col border-r border-white/5 bg-[#0a0e14]">
          <div className="flex gap-1 border-b border-white/5 p-3">
            <button
              type="button"
              onClick={() => setWorkspaceTab("notes")}
              className={tabBtn(workspaceTab === "notes")}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab("projects")}
              className={tabBtn(workspaceTab === "projects")}
            >
              Internal Projects
            </button>
          </div>

          <div className="border-b border-white/5 p-3">
            <button
              type="button"
              onClick={handleNewNote}
              className="w-full rounded-xl bg-gradient-to-r from-[#2962FF] to-[#94aaff] py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.4)] transition hover:brightness-110"
            >
              + New Note
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Folders</h2>
              <button
                type="button"
                onClick={() => {
                  setAddingFolder(true);
                  setFolderDraft("");
                }}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-[#2962FF]"
                aria-label="Add folder"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {addingFolder && (
              <div className="mb-4 flex gap-2">
                <input
                  autoFocus
                  value={folderDraft}
                  onChange={(e) => setFolderDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFolder();
                    if (e.key === "Escape") {
                      setAddingFolder(false);
                      setFolderDraft("");
                    }
                  }}
                  placeholder="Folder name…"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0c1016] px-3 py-2 text-sm font-medium text-[#f1f3fc] placeholder:text-slate-500 outline-none ring-[#2962FF]/0 focus:ring-2 focus:ring-[#2962FF]/40"
                />
                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="rounded-lg bg-[#2962FF] px-3 py-2 text-xs font-bold text-white"
                >
                  Add
                </button>
              </div>
            )}

            {data.folders.length === 0 ? (
              <p className="mb-6 text-[13px] text-slate-500">No folders yet — use + to add one.</p>
            ) : (
              <ul className="mb-6 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedFolderId("all")}
                    className={
                      selectedFolderId === "all"
                        ? "flex w-full items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2.5 text-left text-[13px] font-semibold text-[#f1f3fc] ring-1 ring-[#2962FF]/35"
                        : "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200"
                    }
                  >
                    All notes
                  </button>
                </li>
                {data.folders.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId(f.id)}
                      className={
                        selectedFolderId === f.id
                          ? "flex w-full items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2.5 text-left text-[13px] font-semibold text-white ring-1 ring-[#2962FF]/30"
                          : "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200"
                      }
                    >
                      <FolderIcon />
                      <span className="truncate">{f.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Recent notes</h2>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#151a21]/30 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-[#f1f3fc]">
                  {data.notes.filter((n) => n.workspace === workspaceTab).length === 0
                    ? "No notes yet"
                    : "No matching notes"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {data.notes.filter((n) => n.workspace === workspaceTab).length === 0
                    ? "Create a note with the button above to see it listed here."
                    : "Try a different search or folder."}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredNotes.map((note) => {
                  const isSel = note.id === selectedNoteId;
                  const preview = stripHtml(note.bodyHtml).slice(0, 120);
                  const badge = note.tags[0];
                  return (
                    <li key={note.id}>
                      <div
                        className={
                          isSel
                            ? "group relative w-full rounded-xl border-l-4 border-[#2962FF] bg-[#151a21] p-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                            : "group relative w-full rounded-xl border border-white/5 p-4 text-left transition hover:border-white/10 hover:bg-white/[0.02]"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedNoteId(note.id)}
                          className="w-full text-left"
                        >
                          <p className="font-bold tracking-tight text-white">{note.title || "Untitled Note"}</p>
                          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                            {preview || "Empty note"}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            {badge ? (
                              <span className="rounded-md bg-[#2962FF]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                                {badge}
                              </span>
                            ) : (
                              <span />
                            )}
                            <span className="text-[11px] font-medium text-slate-500">
                              {formatRelativeTime(note.updatedAt)}
                            </span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => deleteNote(note.id, e)}
                          className="absolute right-2 top-2 rounded-md p-1 text-slate-600 opacity-0 transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                          aria-label="Delete note"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Column 3 — Editor */}
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col bg-[#0a0e14]">
          <header className="sticky top-0 z-20 grid h-16 shrink-0 grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-4 border-b border-white/5 bg-[#0a0e14]/90 px-6 backdrop-blur-xl md:px-8">
            <div aria-hidden className="min-w-0" />
            <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#151a21]/80 px-4 py-2 backdrop-blur-xl">
              <svg
                className="h-5 w-5 shrink-0 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#f1f3fc] placeholder:text-slate-500 outline-none"
              />
            </div>
            <div aria-hidden className="min-w-0" />
          </header>

          <div className="relative flex flex-1 flex-col px-8 pb-28 pt-6">
            {selectedNote && (
              <div className="sticky top-4 z-10 mb-6 flex justify-center">
                <NotesEditorToolbar editorRef={editorRef} />
              </div>
            )}

            {!selectedNote ? (
              <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-20 text-center">
                <p className="text-2xl font-bold tracking-tight text-[#f1f3fc]/90">Untitled Note</p>
                <p className="mt-3 max-w-md text-sm text-slate-500">
                  You don&apos;t have a note open yet. Create your first note from the sidebar — your
                  title and body will stay synced with the list.
                </p>
                <button
                  type="button"
                  onClick={handleNewNote}
                  className="mt-8 rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.4)] transition hover:brightness-110"
                >
                  New Note
                </button>
              </div>
            ) : (
              <article className="mx-auto w-full max-w-4xl flex-1 pb-12">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  placeholder="Untitled Note"
                  className="w-full border-none bg-transparent text-[2.5rem] font-bold leading-[1.05] tracking-tight text-[#f1f3fc] placeholder:text-slate-600 outline-none md:text-6xl"
                />

                {selectedNote.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedNote.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[#2962FF]/30 bg-[#2962FF]/10 px-3 py-1 text-xs font-semibold text-sky-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  className="prose prose-invert mt-10 min-h-[320px] max-w-none text-lg leading-relaxed text-[#f1f3fc]/85 outline-none prose-p:my-4 prose-ul:my-4 prose-ol:my-4 focus-visible:ring-2 focus-visible:ring-[#2962FF]/30"
                  data-placeholder="Start writing…"
                />
              </article>
            )}
          </div>

          <footer className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 bg-[#151a21]/80 px-8 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur-xl">
            <span>
              {selectedNote ? `Edited ${formatRelativeTime(selectedNote.updatedAt)}` : "No note selected"}
            </span>
            <span>{charCount.toLocaleString()} characters</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Saved locally
            </span>
          </footer>
        </div>
      </div>

      <Link
        to="/"
        onClick={() => signOut()}
        className="fixed bottom-8 left-[calc(16rem+20rem+2rem)] z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-[#2962FF] hover:underline max-lg:left-8 max-lg:bottom-36"
      >
        Sign out
      </Link>
    </div>
  );
}
