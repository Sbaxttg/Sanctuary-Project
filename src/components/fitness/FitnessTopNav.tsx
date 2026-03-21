import { Link } from "react-router-dom";

export function FitnessTopNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-[#0a0e14]/95 px-6 backdrop-blur-xl md:px-8">
      <Link to="/fitness" className="text-base font-bold tracking-tight text-white">
        Sanctuary Fitness
      </Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex" aria-label="Fitness sections">
        <span className="text-sm font-bold text-app-primary">Dashboard</span>
        <button type="button" className="text-sm font-semibold text-slate-500 transition hover:text-white">
          Workouts
        </button>
        <button type="button" className="text-sm font-semibold text-slate-500 transition hover:text-white">
          Nutrition
        </button>
      </nav>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Settings"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div
          className="ml-1 h-9 w-9 shrink-0 rounded-full ring-2 ring-white/15"
          style={{ background: "linear-gradient(135deg, #2962FF, #1e293b)" }}
        />
      </div>
    </header>
  );
}
