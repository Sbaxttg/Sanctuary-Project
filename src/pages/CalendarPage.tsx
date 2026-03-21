import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { CalendarAIWidget } from "../components/calendar/CalendarAIWidget";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type Cell =
  | { kind: "empty" }
  | {
      kind: "day";
      day: number;
      isToday: boolean;
      events: { label: string; className: string }[];
    };

function buildNovember2023(): Cell[] {
  const year = 2023;
  const month = 10;
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ kind: "empty" });
  for (let d = 1; d <= daysInMonth; d++) {
    const events: { label: string; className: string }[] = [];
    if (d === 3) events.push({ label: "Team standup", className: "bg-[#2962FF] font-bold text-white shadow-sm" });
    if (d === 7) events.push({ label: "Design Sync", className: "bg-violet-600/90 text-white shadow-sm" });
    if (d === 12) events.push({ label: "Product Review", className: "bg-teal-600/90 text-white shadow-sm" });
    if (d === 14) {
      events.push({ label: "Product Review", className: "bg-teal-600/90 text-white shadow-sm" });
      events.push({ label: "Client Call", className: "bg-cyan-600/85 text-white shadow-sm" });
    }
    if (d === 21) events.push({ label: "Client Call", className: "bg-cyan-600/85 text-white shadow-sm" });
    cells.push({ kind: "day", day: d, isToday: d === 14, events });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
  return cells;
}

export function CalendarPage() {
  const grid = useMemo(() => buildNovember2023(), []);

  useEffect(() => {
    document.title = "Sanctuary — Calendar";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen flex-col pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-white/5 bg-[#0a0e14]/80 px-8 backdrop-blur-xl">
          <div className="flex min-w-0 flex-wrap items-baseline gap-3">
            <h1 className="text-lg font-bold tracking-tight text-white">MeadBax Hub</h1>
            <span className="text-sm font-medium text-slate-500">November 2023</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden max-w-xs flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-2 md:flex">
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search events..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
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

        <div className="flex flex-1 flex-col gap-8 p-8 pb-40 xl:flex-row">
          {/* Main column: calendar + bottom cards */}
          <div className="min-w-0 flex-1 space-y-8">
            <section className="rounded-3xl border border-white/5 bg-[#151a21] p-6 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5)] md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight text-white">Monthly Schedule</h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    You have 12 events scheduled this month.
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-white/10 bg-[#0a0e14]/80 p-1">
                  <button
                    type="button"
                    className="rounded-full bg-[#1b2028] px-5 py-2 text-[13px] font-bold text-white shadow-inner"
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-5 py-2 text-[13px] font-semibold text-slate-500 transition hover:text-slate-300"
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-5 py-2 text-[13px] font-semibold text-slate-500 transition hover:text-slate-300"
                  >
                    Day
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-7 border-b border-white/5 pb-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-l border-t border-white/5">
                {grid.map((cell, idx) => {
                  if (cell.kind === "empty") {
                    return (
                      <div
                        key={`e-${idx}`}
                        className="min-h-[120px] border-b border-r border-white/5 bg-[#0a0e14]/30"
                      />
                    );
                  }
                  const { day, isToday, events } = cell;
                  return (
                    <div
                      key={day}
                      className={[
                        "flex min-h-[120px] flex-col border-b border-r border-white/5 p-2",
                        isToday
                          ? "bg-[#2962FF]/10 shadow-[inset_0_0_0_1px_#2962FF,0_0_24px_-4px_rgba(41,98,255,0.35)]"
                          : "bg-[#151a21]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={
                            isToday
                              ? "text-sm font-bold text-app-primary"
                              : "text-sm font-semibold text-slate-400"
                          }
                        >
                          {day}
                        </span>
                        {isToday && (
                          <span className="rounded-full bg-app-primary/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-sky-200">
                            ★ Today
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        {events.map((ev) => (
                          <span
                            key={ev.label + day}
                            className={`truncate rounded-full px-2 py-0.5 text-[9px] font-bold ${ev.className}`}
                          >
                            {ev.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-400/25 via-indigo-500/20 to-app-primary/25 p-6 shadow-lg md:p-8">
                <div className="flex items-center gap-2 text-sky-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2l3.09 6.26L22 9l-6.91 1.01L12 16l-3.09-6.99L2 9l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-widest">Next big milestone</span>
                </div>
                <p className="mt-4 text-lg font-bold leading-snug tracking-tight text-[#0a0e14]">
                  Launch of Phase 2 dashboard updates — coordinated rollout across MeadBax Hub.
                </p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[#151a21] p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Collaborators
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"].map((c, i) => (
                      <div
                        key={i}
                        className="h-9 w-9 rounded-full border-2 border-[#151a21] ring-2 ring-white/10"
                        style={{ background: `linear-gradient(135deg, ${c}, #1e293b)` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    7 active members on this week&apos;s tasks
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Task sidebar */}
          <aside className="w-full shrink-0 rounded-2xl border border-white/5 bg-[#151a21]/50 p-6 shadow-deep backdrop-blur-md xl:w-80">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold tracking-tight text-white">Tasks due</h3>
              <span className="rounded-full bg-app-primary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                3 remaining
              </span>
            </div>
            <div className="mt-6 flex gap-2">
              <input
                type="text"
                placeholder="Quick add task..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0a0e14] px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="button"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-app-primary font-bold text-white shadow-[0_4px_16px_rgba(41,98,255,0.45)]"
                aria-label="Add task"
              >
                +
              </button>
            </div>
            <ul className="mt-8 space-y-4">
              <li className="rounded-xl border border-white/5 bg-[#0a0e14] p-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-300">
                        High
                      </span>
                      <span className="text-sm font-bold text-white">Review Q4 deck</span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Due in 2 hours · Finance
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-xl border border-white/5 bg-[#0a0e14] p-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-violet-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                        Med
                      </span>
                      <span className="text-sm font-bold text-white">Sync with design</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Due tomorrow · Product</p>
                  </div>
                </div>
              </li>
              <li className="rounded-xl border border-white/5 bg-[#0a0e14]/60 p-4 opacity-80">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-500 line-through">Check weather alerts</p>
                    <p className="mt-1 text-xs text-slate-600">Completed</p>
                  </div>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <CalendarAIWidget />

      <Link
        to="/"
        onClick={() => clearDevBypass()}
        className="fixed bottom-8 left-8 z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-app-primary hover:underline xl:left-[calc(16rem+2rem)]"
      >
        Sign out (preview)
      </Link>
    </div>
  );
}
