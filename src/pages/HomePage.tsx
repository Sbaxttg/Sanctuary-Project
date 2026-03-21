import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { DashboardAIWidget } from "../components/dashboard/DashboardAIWidget";
import { SideNavBar } from "../components/dashboard/SideNavBar";

function ordinalDay(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${s[v % 10] ?? "th"}`;
}

function formatLongDate(d: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${ordinalDay(d.getDate())}`;
}

function dayOfYear365(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.min(365, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function LargeQuoteDecoration() {
  return (
    <span
      className="mb-8 block text-center font-serif text-[4.5rem] font-light leading-none text-app-accent-soft/35"
      aria-hidden
    >
      &ldquo;
    </span>
  );
}

export function HomePage() {
  const now = useNow();
  const day = dayOfYear365();

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    document.title = "Sanctuary — The Nocturnal Dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-white/5 bg-[#0a0e14]/60 px-8 backdrop-blur-xl">
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
        </header>

        <main className="p-8 pb-40">
          <div className="mb-10 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
              Dashboard
            </p>
            <h1 className="text-3xl font-extrabold tracking-tighter text-white md:text-4xl">
              The Nocturnal Dashboard
            </h1>
          </div>

          {/* Current atmosphere */}
          <section className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Current atmosphere
              </p>
              <p
                className="mt-1 text-[clamp(3.5rem,8vw,5.5rem)] font-extrabold leading-none tracking-tighter text-[#f1f3fc]"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                {timeStr}
              </p>
              <p className="mt-3 text-lg font-medium text-slate-400">
                {formatLongDate(now)}
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-[#0f141a] px-5 py-2.5 shadow-deep">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                Day {day} of 365
              </span>
            </div>
          </section>

          {/* Masonry wall */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Large Dickens — spans 7 cols, 2 rows on lg */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f141a] p-8 text-center shadow-deep sm:p-12 lg:col-span-7 lg:row-span-2 lg:min-h-[420px]">
              <LargeQuoteDecoration />
              <blockquote className="font-serif text-2xl font-light italic leading-snug tracking-tight text-slate-100 sm:text-3xl md:text-4xl">
                &ldquo;The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.&rdquo;
              </blockquote>
              <footer className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                Charles Dickens
              </footer>
            </article>

            {/* Tim Ferriss — top right */}
            <article className="flex flex-col justify-center rounded-2xl border border-white/10 bg-[#0f141a] p-8 shadow-deep sm:p-10 lg:col-span-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light italic leading-relaxed text-slate-200 sm:text-2xl">
                &ldquo;Focus on being productive instead of busy.&rdquo;
              </p>
              <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                — Tim Ferriss
              </p>
            </article>

            {/* Gradient energy */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/90 via-violet-600/80 to-app-primary/90 p-8 shadow-deep sm:p-12 lg:col-span-5">
              <div className="mb-6 text-white/90">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light italic leading-relaxed text-white sm:text-2xl md:text-3xl">
                &ldquo;Energy flows where attention goes.&rdquo;
              </p>
            </article>

            {/* Lao Tzu landscape */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 shadow-deep lg:col-span-7 min-h-[280px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/75 to-transparent" />
              <div className="relative flex h-full min-h-[280px] flex-col justify-end p-8 sm:p-12">
                <p className="font-serif text-xl font-light italic leading-relaxed text-white sm:text-2xl md:text-3xl">
                  &ldquo;Nature does not hurry, yet everything is accomplished.&rdquo;
                </p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                  Lao Tzu
                </p>
              </div>
            </article>

            {/* Progress */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-8 shadow-deep sm:p-12 lg:col-span-5">
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10rem] font-extrabold leading-none text-white/[0.04] select-none">
                01
              </span>
              <div className="relative">
                <p className="font-serif text-xl font-light italic leading-relaxed text-slate-200 sm:text-2xl">
                  &ldquo;Small steps lead to great distances.&rdquo;
                </p>
                <div className="mt-10">
                  <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span>Daily progress</span>
                    <span className="text-app-accent-soft">66%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full w-[66%] rounded-full bg-gradient-to-r from-app-accent-soft to-app-primary shadow-[0_0_16px_rgba(148,170,255,0.5)]"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            </article>
          </section>

          <p className="mt-10 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Midnight Velocity — Sanctuary
          </p>
        </main>
      </div>

      <DashboardAIWidget />

      <Link
        to="/"
        onClick={() => clearDevBypass()}
        className="fixed bottom-8 left-[calc(16rem+2rem)] z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-app-primary hover:underline max-lg:left-8 max-lg:bottom-32"
      >
        Sign out (preview)
      </Link>
    </div>
  );
}
