import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { NotesAIWidget } from "../components/notes/NotesAIWidget";

function FolderIcon() {
  return (
    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ToolbarIcon({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

export function NotesPage() {
  useEffect(() => {
    document.title = "Sanctuary — Notes";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        {/* Column 2 — Notes sidebar */}
        <aside className="sticky top-0 flex h-screen w-80 shrink-0 flex-col border-r border-white/5 bg-[#0a0e14]">
          <div className="flex gap-1 border-b border-white/5 p-3">
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#151a21] py-2.5 text-center text-[13px] font-bold text-white"
            >
              Notes
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg py-2.5 text-center text-[13px] font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
            >
              Internal Projects
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Folders
              </h2>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                aria-label="Add folder"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <ul className="space-y-1">
              {["Strategy 2024", "Product Vision", "Journal"].map((name, i) => (
                <li key={name}>
                  <button
                    type="button"
                    className={
                      i === 0
                        ? "flex w-full items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2.5 text-left text-[13px] font-semibold text-white"
                        : "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-200"
                    }
                  >
                    <FolderIcon />
                    {name}
                  </button>
                </li>
              ))}
            </ul>

            <h2 className="mb-4 mt-10 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Recent notes
            </h2>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  className="w-full rounded-xl border-l-4 border-app-primary bg-[#151a21] p-6 text-left transition hover:bg-[#1a2029]"
                >
                  <p className="font-bold text-white">Quarterly Review Q4</p>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                    Aligning roadmap with MeadBax Hub milestones and growth targets for the
                    coming quarter…
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-app-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      Work
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">2h ago</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/5 p-6 text-left transition hover:border-white/10 hover:bg-white/[0.02]"
                >
                  <p className="font-bold text-white">MeadBax Hub Launch Plan</p>
                  <p className="mt-2 line-clamp-2 text-[13px] text-slate-500">
                    Pre-launch checklist and stakeholder comms…
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                      Urgent
                    </span>
                    <span className="text-[11px] text-slate-500">1d ago</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/5 p-6 text-left transition hover:border-white/10 hover:bg-white/[0.02]"
                >
                  <p className="font-bold text-white">Weekly Brainstorm</p>
                  <p className="mt-2 line-clamp-2 text-[13px] text-slate-500">
                    Ideas backlog and parking lot items…
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-600/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Misc
                    </span>
                    <span className="text-[11px] text-slate-500">3d ago</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Column 3 — Editor */}
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col bg-[#0a0e14]">
          <header className="sticky top-0 z-20 grid h-16 shrink-0 grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-4 border-b border-white/5 bg-[#0a0e14]/80 px-6 backdrop-blur-xl md:px-8">
            <div aria-hidden className="min-w-0" />
            <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016]/80 px-4 py-2 backdrop-blur-md">
              <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search notes..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Settings"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </header>

          <div className="relative flex flex-1 justify-center px-8 pb-28 pt-6">
            {/* Floating format toolbar */}
            <div className="sticky top-20 z-10 mb-8 flex justify-center">
              <div className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#151a21]/80 p-2 shadow-deep backdrop-blur-md">
                <ToolbarIcon>
                  <span className="text-sm font-bold">B</span>
                </ToolbarIcon>
                <ToolbarIcon>
                  <span className="text-sm italic">I</span>
                </ToolbarIcon>
                <ToolbarIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </ToolbarIcon>
                <ToolbarIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </ToolbarIcon>
                <ToolbarIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </ToolbarIcon>
                <ToolbarIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </ToolbarIcon>
              </div>
            </div>

            <article className="mx-auto w-full max-w-4xl">
              <h1 className="text-[3.75rem] font-bold leading-[1.05] tracking-tighter text-[#f1f3fc] md:text-6xl">
                Quarterly Review Q4
              </h1>

              <div className="mt-10 space-y-6 text-lg leading-relaxed text-[#f1f3fc]/80">
                <p>
                  This quarter we&apos;re doubling down on clarity: fewer parallel bets, sharper
                  ownership, and measurable outcomes every sprint. The north star remains{" "}
                  <span className="font-semibold text-[#e8ecff]">MeadBax Hub</span> — our
                  flagship surface for decisions, rituals, and momentum.
                </p>
                <p>
                  We&apos;ll review pipeline health, retention signals, and the operational runway
                  required to scale without burning the team out. Expect candid discussion on
                  trade-offs: speed vs. polish, breadth vs. depth.
                </p>
              </div>

              <div className="mt-12 rounded-2xl border border-violet-500/25 bg-violet-950/20 p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300/90">
                  Core objectives
                </p>
                <ul className="mt-6 space-y-4">
                  {[
                    "Ship MeadBax Hub v1 with onboarding that feels inevitable.",
                    "Hit weekly active usage targets across core workflows.",
                    "Reduce support load via clearer defaults and in-product guidance.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-[#f1f3fc]/90">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30 text-violet-200">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mt-12 overflow-hidden rounded-2xl border border-white/10">
                <div
                  className="h-56 w-full bg-cover bg-center blur-sm"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/40 to-transparent" />
              </div>
            </article>
          </div>

          <footer className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 bg-[#0a0e14]/90 px-8 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur-xl">
            <span>Edited 2 minutes ago</span>
            <span>2,481 characters</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              Synced
            </span>
          </footer>
        </div>
      </div>

      <NotesAIWidget />

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
