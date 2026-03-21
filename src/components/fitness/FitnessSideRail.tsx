import { Link } from "react-router-dom";

function DashboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function DumbbellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c1 2 0 4-1 5 2 0 4 1 5 3-1 3-4 5-6 5s-5-2-6-5c1-2 3-3 5-3-1-1-2-3-1-5 2 0 4 1 4 1z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-3z" />
    </svg>
  );
}

const items: { label: string; icon: typeof DashboardIcon; active?: boolean }[] = [
  { label: "Dashboard", icon: DashboardIcon, active: true },
  { label: "Workouts", icon: DumbbellIcon },
  { label: "Nutrition", icon: AppleIcon },
  { label: "Analytics", icon: ChartIcon },
  { label: "Sanctuary", icon: ShieldIcon },
];

export function FitnessSideRail() {
  return (
    <aside className="fixed bottom-0 left-0 top-14 z-30 flex w-64 flex-col border-r border-white/5 bg-[#0f141a]">
      <div className="border-b border-white/5 px-5 pb-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-app-primary/20 shadow-[0_0_20px_rgba(41,98,255,0.45)] ring-1 ring-app-primary/40">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">The Sanctuary</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">Elite performance</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-6" aria-label="Fitness">
        {items.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={
              active
                ? "relative flex w-full items-center gap-3 rounded-lg border-l-4 border-app-primary bg-white/[0.06] py-3 pl-2 pr-3 text-left text-[14px] font-bold text-white"
                : "flex w-full items-center gap-3 rounded-lg py-3 pl-3 pr-3 text-left text-[14px] font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
            }
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="w-full rounded-xl bg-[#94aaff] py-3.5 text-sm font-bold text-[#0a0e14] shadow-[0_8px_24px_rgba(148,170,255,0.35)] transition hover:brightness-105"
        >
          Start Workout
        </button>
      </div>

      <div className="mt-auto border-t border-white/5 px-3 py-4">
        <Link
          to="/home"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-1.414 1.414M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
          Support
        </Link>
        <Link
          to="/home"
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
    </aside>
  );
}
