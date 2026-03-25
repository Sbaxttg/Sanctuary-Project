import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { EmailAIWidget } from "../components/email/EmailAIWidget";
import { ComposeModal } from "../components/email/ComposeModal";
import { GMAIL_SCOPES, loadGoogleIdentityScript } from "../lib/googleIdentity";
import {
  buildMimeMessage,
  getFullMessage,
  loadInboxSummaries,
  modifyLabels,
  sendRawMessage,
  trashMessage,
  type FullMessageBody,
  type GmailMessageSummary,
} from "../lib/gmailApi";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

type MailFilter = "all" | "unread" | "attachments";

function formatListTime(internalDate: string): string {
  const n = Number(internalDate);
  if (!n) return "";
  return new Date(n).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatReaderMeta(dateHeader: string, internalDate: string): string {
  if (dateHeader) return dateHeader;
  const n = Number(internalDate);
  if (!n) return "";
  return new Date(n).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function extractEmail(fromHeader: string): string {
  const m = fromHeader.match(/<([^>]+)>/);
  if (m) return m[1].trim();
  const m2 = fromHeader.match(/([\w.+-]+@[\w.-]+\.[a-z]{2,})/i);
  return m2 ? m2[1] : fromHeader.trim();
}

function filterQuery(filter: MailFilter): string | undefined {
  if (filter === "unread") return "is:unread";
  if (filter === "attachments") return "has:attachment";
  return undefined;
}

function ToolbarIcon({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg bg-[#151a21]/80 p-2 text-slate-400 backdrop-blur-xl transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function EmptyReaderIcon() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#151a21]/80 shadow-[inset_0_0_0_1px_rgba(41,98,255,0.15)] backdrop-blur-xl">
        <svg
          className="h-10 w-10 text-[#2962FF]/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.25}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight text-[#f1f3fc]">Select an email to read</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Choose a message from your inbox to view it here.
        </p>
      </div>
    </div>
  );
}

export function EmailPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullBody, setFullBody] = useState<FullMessageBody | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingBody, setLoadingBody] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [mailFilter, setMailFilter] = useState<MailFilter>("all");
  const [search, setSearch] = useState("");

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  const [replyDraft, setReplyDraft] = useState("");

  useEffect(() => {
    document.title = "The Sanctuary — Inbox";
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchList = useCallback(
    async (token: string) => {
      setLoadingList(true);
      setError(null);
      try {
        const q = filterQuery(mailFilter);
        const sorted = await loadInboxSummaries(token, 50, q);
        if (sorted.length === 0) {
          setMessages([]);
          setSelectedId(null);
          setFullBody(null);
          return;
        }
        setMessages(sorted);
        setSelectedId((prev) => {
          if (prev && sorted.some((m) => m.id === prev)) return prev;
          return sorted[0]?.id ?? null;
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not load messages.";
        setError(msg);
        setMessages([]);
      } finally {
        setLoadingList(false);
      }
    },
    [mailFilter],
  );

  useEffect(() => {
    if (!accessToken) return;
    void fetchList(accessToken);
  }, [accessToken, fetchList]);

  const requestAccessToken = useCallback(() => {
    if (!CLIENT_ID) {
      setError("Missing VITE_GOOGLE_CLIENT_ID. Add it to your .env file.");
      return;
    }
    setAuthBusy(true);
    setError(null);
    void (async () => {
      try {
        await loadGoogleIdentityScript();
        const oauth2 = window.google?.accounts?.oauth2;
        if (!oauth2) {
          setError("Google Identity Services did not load.");
          setAuthBusy(false);
          return;
        }
        const client = oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: GMAIL_SCOPES,
          callback: (resp) => {
            setAuthBusy(false);
            if (resp.error) {
              setError(resp.error_description ?? resp.error);
              return;
            }
            if (resp.access_token) {
              setAccessToken(resp.access_token);
              showToast("Gmail connected");
            }
          },
        });
        client.requestAccessToken();
      } catch (e) {
        setAuthBusy(false);
        setError(e instanceof Error ? e.message : "Sign-in failed");
      }
    })();
  }, [showToast]);

  const disconnect = useCallback(() => {
    setAccessToken(null);
    setMessages([]);
    setSelectedId(null);
    setFullBody(null);
    showToast("Disconnected from Gmail");
  }, [showToast]);

  useEffect(() => {
    if (!accessToken || !selectedId) {
      setFullBody(null);
      return;
    }
    let cancelled = false;
    setLoadingBody(true);
    void (async () => {
      try {
        const body = await getFullMessage(accessToken, selectedId);
        if (!cancelled) setFullBody(body);
      } catch (e) {
        if (!cancelled) {
          setFullBody(null);
          setError(e instanceof Error ? e.message : "Could not load message");
        }
      } finally {
        if (!cancelled) setLoadingBody(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedId]);

  const selectedSummary = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.snippet.toLowerCase().includes(q),
    );
  }, [messages, search]);

  useEffect(() => {
    if (filteredMessages.length === 0) {
      if (selectedId) setSelectedId(null);
      return;
    }
    if (!selectedId) return;
    if (!filteredMessages.some((m) => m.id === selectedId)) {
      setSelectedId(filteredMessages[0]?.id ?? null);
    }
  }, [filteredMessages, selectedId]);

  const selectedIndex = useMemo(
    () => (selectedId ? filteredMessages.findIndex((m) => m.id === selectedId) : -1),
    [filteredMessages, selectedId],
  );

  const goPrev = () => {
    if (selectedIndex <= 0) return;
    setSelectedId(filteredMessages[selectedIndex - 1].id);
  };

  const goNext = () => {
    if (selectedIndex < 0 || selectedIndex >= filteredMessages.length - 1) return;
    setSelectedId(filteredMessages[selectedIndex + 1].id);
  };

  const openCompose = () => {
    setComposeError(null);
    setComposeOpen(true);
  };

  const openComposeReply = () => {
    if (!fullBody || !selectedSummary) return;
    const email = extractEmail(fullBody.from);
    setComposeTo(email);
    const subj = fullBody.subject.startsWith("Re:") ? fullBody.subject : `Re: ${fullBody.subject}`;
    setComposeSubject(subj);
    setComposeBody(replyDraft ? `${replyDraft}\n\n` : "");
    setComposeError(null);
    setComposeOpen(true);
  };

  const sendCompose = async () => {
    if (!accessToken) return;
    const to = composeTo.trim();
    const subject = composeSubject.trim();
    const body = composeBody.trim();
    if (!to || !subject) {
      setComposeError("To and Subject are required.");
      return;
    }
    setComposeSending(true);
    setComposeError(null);
    try {
      const raw = buildMimeMessage(to, subject, body || " ");
      await sendRawMessage(accessToken, raw);
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      showToast("Message sent");
      await fetchList(accessToken);
    } catch (e) {
      setComposeError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setComposeSending(false);
    }
  };

  const runWithToken = async (fn: (token: string) => Promise<void>) => {
    if (!accessToken || !selectedId) return;
    try {
      await fn(accessToken);
      showToast("Updated");
      setFullBody(null);
      setSelectedId(null);
      await fetchList(accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  };

  const handleArchive = () => {
    if (!selectedId) return;
    void runWithToken((token) => modifyLabels(token, selectedId, [], ["INBOX"]));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    void runWithToken((token) => trashMessage(token, selectedId!));
  };

  const handleSpam = () => {
    if (!selectedId) return;
    void runWithToken((token) =>
      modifyLabels(token, selectedId!, ["SPAM"], ["INBOX", "UNREAD"]),
    );
  };

  const handleStar = () => {
    if (!selectedId || !selectedSummary) return;
    const starred = selectedSummary.labelIds.includes("STARRED");
    void (async () => {
      if (!accessToken) return;
      try {
        if (starred) {
          await modifyLabels(accessToken, selectedId, [], ["STARRED"]);
          showToast("Star removed");
        } else {
          await modifyLabels(accessToken, selectedId, ["STARRED"], []);
          showToast("Starred");
        }
        await fetchList(accessToken);
        if (selectedId) {
          const body = await getFullMessage(accessToken, selectedId);
          setFullBody(body);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    })();
  };

  const isStarred = selectedSummary?.labelIds.includes("STARRED") ?? false;

  const tabClass = (active: boolean) =>
    active
      ? "border-b-2 border-[#2962FF] pb-1 text-[#f1f3fc]"
      : "text-slate-500 transition hover:text-slate-300";

  const hasClient = Boolean(CLIENT_ID);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-manrope text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        {/* Pane 2 — Inbox */}
        <aside className="sticky top-0 flex h-screen w-80 shrink-0 flex-col border-r border-white/5 bg-[#0a0e14]">
          <div className="border-b border-white/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold tracking-tighter text-white md:text-3xl">
                Sanctuary Inbox
              </h1>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={requestAccessToken}
                disabled={authBusy || !hasClient}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#2962FF]/40 bg-[#151a21]/80 px-4 py-2.5 text-sm font-bold text-[#f1f3fc] shadow-[inset_0_0_0_1px_rgba(41,98,255,0.2)] backdrop-blur-xl transition hover:border-[#2962FF]/60 hover:brightness-110 disabled:opacity-50"
              >
                <svg className="h-4 w-4 text-[#2962FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {accessToken ? "Reconnect Gmail" : "Sync Gmail"}
              </button>
              <button
                type="button"
                onClick={openCompose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.4)] transition hover:brightness-110"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Compose
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[13px] font-semibold">
              <button
                type="button"
                onClick={() => setMailFilter("all")}
                className={tabClass(mailFilter === "all")}
              >
                All Mail
              </button>
              <button
                type="button"
                onClick={() => setMailFilter("unread")}
                className={tabClass(mailFilter === "unread")}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => setMailFilter("attachments")}
                className={tabClass(mailFilter === "attachments")}
              >
                Attachments
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-3">
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
                placeholder="Search mail..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="mb-4 flex items-end justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#f1f3fc]/40">
                Inbox
              </h2>
              {accessToken && (
                <button
                  type="button"
                  onClick={disconnect}
                  className="text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-[#2962FF] hover:underline"
                >
                  Disconnect
                </button>
              )}
            </div>

            {!hasClient && (
              <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100/90">
                <p>
                  Add your Google OAuth <strong>Web client ID</strong> to{" "}
                  <code className="rounded bg-black/30 px-1">.env</code> as{" "}
                  <code className="rounded bg-black/30 px-1">VITE_GOOGLE_CLIENT_ID</code>, then restart{" "}
                  <code className="rounded bg-black/30 px-1">npm run dev</code>.
                </p>
                <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-amber-100/80">
                  <li>
                    Enable{" "}
                    <a
                      href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-200 underline-offset-2 hover:underline"
                    >
                      Gmail API
                    </a>{" "}
                    for your Cloud project.
                  </li>
                  <li>
                    Configure the{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials/consent"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-200 underline-offset-2 hover:underline"
                    >
                      OAuth consent screen
                    </a>{" "}
                    (add Gmail scopes; in <strong>Testing</strong>, add yourself as a{" "}
                    <strong>test user</strong>).
                  </li>
                  <li>
                    Create an{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-amber-200 underline-offset-2 hover:underline"
                    >
                      OAuth 2.0 Client ID
                    </a>{" "}
                    (Web application). Under <strong>Authorized JavaScript origins</strong>, add{" "}
                    <code className="rounded bg-black/25 px-1">{window.location.origin}</code>.
                  </li>
                </ol>
              </div>
            )}

            {!accessToken && hasClient && (
              <div className="rounded-xl border border-white/10 bg-[#151a21]/40 p-6 text-center backdrop-blur-sm">
                <p className="text-sm font-semibold text-[#f1f3fc]">Sign in to sync emails</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Use <span className="text-[#2962FF]">Sync Gmail</span> to connect your Google
                  account and load messages.
                </p>
              </div>
            )}

            {accessToken && loadingList && (
              <p className="py-8 text-center text-sm text-slate-500">Loading messages…</p>
            )}

            {accessToken && !loadingList && filteredMessages.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-[#151a21]/30 p-6 text-center">
                <p className="text-sm font-semibold text-[#f1f3fc]">No emails found</p>
                <p className="mt-2 text-xs text-slate-500">
                  Try another filter or check back later.
                </p>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}

            <ul className="space-y-3 pt-2">
              {filteredMessages.map((mail) => {
                const isSel = mail.id === selectedId;
                return (
                  <li key={mail.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(mail.id)}
                      className={
                        isSel
                          ? "w-full rounded-xl border-l-4 border-[#2962FF] bg-[#151a21] p-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                          : "w-full rounded-xl border border-white/5 bg-[#151a21]/60 p-4 text-left transition hover:border-white/10 hover:bg-[#151a21]"
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {isSel && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2962FF]/50" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2962FF]" />
                            </span>
                          )}
                          <span className="truncate font-bold text-white">{mail.from}</span>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-slate-500">
                          {formatListTime(mail.internalDate)}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-[13px] font-bold tracking-tight text-[#f1f3fc]">
                        {mail.subject}
                      </p>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                        {mail.snippet}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Pane 3 — Reader */}
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col bg-[#0a0e14]">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#0a0e14]/95 px-6 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarIcon
                label="Archive"
                disabled={!accessToken || !selectedId}
                onClick={handleArchive}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </ToolbarIcon>
              <ToolbarIcon
                label="Delete"
                disabled={!accessToken || !selectedId}
                onClick={handleDelete}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </ToolbarIcon>
              <ToolbarIcon
                label="Mark as spam"
                disabled={!accessToken || !selectedId}
                onClick={handleSpam}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </ToolbarIcon>
              <ToolbarIcon
                label={isStarred ? "Remove star" : "Star"}
                disabled={!accessToken || !selectedId}
                onClick={handleStar}
              >
                <svg
                  className={`h-5 w-5 ${isStarred ? "text-[#2962FF]" : ""}`}
                  fill={isStarred ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </ToolbarIcon>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={goPrev}
                disabled={selectedIndex <= 0}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={selectedIndex < 0 || selectedIndex >= filteredMessages.length - 1}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:pb-8">
            {!accessToken && (
              <EmptyReaderIcon />
            )}

            {accessToken && !selectedId && !loadingList && (
              <EmptyReaderIcon />
            )}

            {accessToken && selectedId && loadingBody && (
              <p className="py-12 text-center text-slate-500">Loading message…</p>
            )}

            {accessToken && selectedId && fullBody && !loadingBody && (
              <>
                <h2 className="text-[36px] font-bold leading-tight tracking-tight text-[#f1f3fc]">
                  {fullBody.subject}
                </h2>

                <div className="mt-8 flex flex-wrap items-start gap-4">
                  <div
                    className="h-12 w-12 shrink-0 rounded-full ring-2 ring-white/10"
                    style={{
                      background: "linear-gradient(135deg, #2962FF, #1e293b)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-white">{fullBody.from}</p>
                    {fullBody.to ? (
                      <p className="text-sm text-slate-500">To: {fullBody.to}</p>
                    ) : null}
                    <p className="mt-2 text-sm text-slate-400">
                      {formatReaderMeta(fullBody.date, selectedSummary?.internalDate ?? "")}
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert mt-10 max-w-none">
                  {fullBody.html ? (
                    <div
                      className="email-html text-lg leading-relaxed text-[#f1f3fc]/85 [&_a]:text-[#2962FF]"
                      dangerouslySetInnerHTML={{ __html: fullBody.html }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-lg leading-relaxed text-[#f1f3fc]/85">
                      {fullBody.plain ?? "(No body)"}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-white/5 bg-[#151a21]/80 px-6 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-3">
              <input
                type="text"
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    openComposeReply();
                  }
                }}
                placeholder="Type a quick reply…"
                disabled={!accessToken || !fullBody}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#f1f3fc] placeholder:text-slate-500 outline-none disabled:opacity-40"
              />
              <button
                type="button"
                disabled={!accessToken || !fullBody}
                onClick={openComposeReply}
                className="shrink-0 rounded-lg bg-gradient-to-r from-[#2962FF] to-[#94aaff] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        to={composeTo}
        subject={composeSubject}
        body={composeBody}
        onToChange={setComposeTo}
        onSubjectChange={setComposeSubject}
        onBodyChange={setComposeBody}
        onSend={sendCompose}
        sending={composeSending}
        error={composeError}
      />

      <EmailAIWidget />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[110] -translate-x-1/2 rounded-full border border-white/10 bg-[#151a21]/95 px-5 py-2.5 text-sm font-semibold text-[#f1f3fc] shadow-lg backdrop-blur-xl">
          {toast}
        </div>
      )}

      <Link
        to="/"
        onClick={() => clearDevBypass()}
        className="fixed bottom-8 left-[calc(16rem+20rem+2rem)] z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-[#2962FF] hover:underline max-lg:left-8 max-lg:bottom-36"
      >
        Sign out (preview)
      </Link>
    </div>
  );
}
