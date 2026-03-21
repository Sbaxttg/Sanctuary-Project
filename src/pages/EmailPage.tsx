import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { EmailAIWidget } from "../components/email/EmailAIWidget";

type EmailPreview = {
  id: string;
  sender: string;
  time: string;
  subject: string;
  preview: string;
  label: { text: string; className: string };
};

const INBOX: EmailPreview[] = [
  {
    id: "1",
    sender: "Alex Rivera",
    time: "10:45 AM",
    subject: "Final Design Review for Q4 Sanctuary Branding",
    preview:
      "Hi team — attaching the consolidated feedback from brand and product. We’re aligned on the midnight palette…",
    label: { text: "Project", className: "border border-violet-500/30 bg-violet-500/15 text-violet-200" },
  },
  {
    id: "2",
    sender: "Sarah Jenkins",
    time: "9:12 AM",
    subject: "Campaign assets due EOD",
    preview:
      "Quick reminder: we need the hero stills and copy variants for the launch sequence before standup tomorrow.",
    label: { text: "Marketing", className: "border border-teal-500/30 bg-teal-500/15 text-teal-200" },
  },
  {
    id: "3",
    sender: "System",
    time: "8:01 AM",
    subject: "Security digest — weekly summary",
    preview:
      "No critical alerts. Two medium findings recommended for review in the admin console under Policies.",
    label: { text: "System", className: "border border-red-500/30 bg-red-500/15 text-red-200" },
  },
];

function ToolbarIcon({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      className="rounded-lg bg-[#151a21] p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </button>
  );
}

export function EmailPage() {
  const [selectedId, setSelectedId] = useState("1");

  useEffect(() => {
    document.title = "Sanctuary — Email";
  }, []);

  const selected = INBOX.find((e) => e.id === selectedId) ?? INBOX[0];

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        {/* Pane 2 — Inbox */}
        <aside className="sticky top-0 flex h-screen w-80 shrink-0 flex-col border-r border-white/5 bg-[#0a0e14]">
          <div className="border-b border-white/5 p-6">
            <h1 className="text-2xl font-extrabold tracking-tighter text-white md:text-3xl">
              The Nocturnal Dashboard
            </h1>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.4)] transition hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Compose
            </button>

            <div className="mt-8 flex flex-wrap gap-4 text-[13px] font-semibold">
              <button type="button" className="border-b-2 border-app-primary pb-1 text-white">
                All Mail
              </button>
              <button type="button" className="text-slate-500 transition hover:text-slate-300">
                Unread
              </button>
              <button type="button" className="text-slate-500 transition hover:text-slate-300">
                Attachments
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search mail..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="mb-4 flex items-end justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#f1f3fc]/40">
                Recent updates
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">Today, Oct 24</span>
            </div>
            <ul className="space-y-3">
              {INBOX.map((mail) => {
                const isSel = mail.id === selectedId;
                return (
                  <li key={mail.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(mail.id)}
                      className={
                        isSel
                          ? "w-full rounded-xl border-l-4 border-app-primary bg-[#151a21] p-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                          : "w-full rounded-xl border border-white/5 bg-[#151a21]/60 p-4 text-left transition hover:border-white/10 hover:bg-[#151a21]"
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isSel && (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-app-primary/50" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-app-primary" />
                            </span>
                          )}
                          <span className="font-bold text-white">{mail.sender}</span>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-slate-500">{mail.time}</span>
                      </div>
                      <p className="mt-2 text-[13px] font-bold text-slate-100">{mail.subject}</p>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-500">{mail.preview}</p>
                      <p
                        className={`mt-3 inline-block rounded px-2 py-1 text-xs font-bold uppercase tracking-widest ${mail.label.className}`}
                      >
                        {mail.label.text}
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
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/5 px-6 py-4 md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarIcon label="Archive">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </ToolbarIcon>
              <ToolbarIcon label="Delete">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </ToolbarIcon>
              <ToolbarIcon label="Mark as spam">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </ToolbarIcon>
              <ToolbarIcon label="Star">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </ToolbarIcon>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Previous"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Next"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:pb-8">
            <h2 className="text-[36px] font-bold leading-tight tracking-tight text-[#f1f3fc]">
              {selected.subject}
            </h2>

            <div className="mt-8 flex flex-wrap items-start gap-4">
              <div
                className="h-12 w-12 shrink-0 rounded-full ring-2 ring-white/10"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1e293b)",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-white">{selected.sender}</p>
                <p className="text-sm text-slate-500">
                  {selected.sender === "System" ? "noreply@sanctuary.app" : "alex.rivera@meadbax.com"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {selected.sender === "System"
                    ? `Automated message · ${selected.time} · Monday, October 24, 2024`
                    : `to me, sarah.j, +2 others · ${selected.time} · Monday, October 24, 2024`}
                </p>
              </div>
            </div>

            <div className="prose prose-invert mt-10 max-w-none">
              {selected.id === "1" ? (
                <div className="space-y-6 text-lg leading-relaxed text-[#f1f3fc]/80">
                  <p>Hi team,</p>
                  <p>
                    Attaching the consolidated feedback from brand and product. We&apos;re aligned on the
                    midnight palette and typography hierarchy for the Sanctuary rollout. The
                    nocturnal dashboard should feel calm, decisive, and fast — never noisy.
                  </p>
                  <p>Key asks before Friday:</p>
                  <ul className="mt-4 list-none space-y-3 pl-0">
                    {[
                      "Lock hero variants for email + notes surfaces.",
                      "Confirm accessibility contrast on secondary rails.",
                      "Publish the Q4 narrative for exec review.",
                    ].map((item) => (
                      <li key={item} className="flex gap-3 text-[#f1f3fc]/85">
                        <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-primary text-white">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pt-2">Thanks — Alex</p>
                </div>
              ) : (
                <div className="space-y-4 text-lg leading-relaxed text-[#f1f3fc]/80">
                  <p>{selected.preview}</p>
                  <p className="text-slate-500">…</p>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-white/5 bg-[#0a0e14]/95 px-6 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-3">
              <input
                type="text"
                placeholder="Type a quick reply..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <EmailAIWidget />

      <Link
        to="/"
        onClick={() => clearDevBypass()}
        className="fixed bottom-8 left-[calc(16rem+20rem+2rem)] z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-app-primary hover:underline max-lg:left-8 max-lg:bottom-36"
      >
        Sign out (preview)
      </Link>
    </div>
  );
}
