import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { useRegisterAISanctuary } from "../context/AISanctuaryContext";
import { MOTIVATIONAL_QUOTES, type MotivationalQuote } from "../data/motivationalQuotes";
import { pickUniqueRandomQuotes } from "../lib/quotePicker";

const QUOTE_GRID_SLOTS = 5;

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

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function useNowTick(everyMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), everyMs);
    return () => window.clearInterval(t);
  }, [everyMs]);
  return now;
}

function LargeQuoteDecoration() {
  return (
    <span
      className="mb-6 block text-center font-serif text-[2.75rem] font-light leading-none text-[#94aaff]/35 sm:mb-8 sm:text-[3.5rem] md:text-[4.5rem]"
      aria-hidden
    >
      &ldquo;
    </span>
  );
}

function QuoteCardActions({
  onFavorite,
  onShare,
}: {
  onFavorite: () => void;
  onShare: () => void;
}) {
  return (
    <div className="absolute right-4 top-4 flex gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-[#2962FF]"
        aria-label="Favorite quote"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-[#2962FF]"
        aria-label="Share quote"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
      </button>
    </div>
  );
}

export function HomePage() {
  const now = useNowTick(1000);
  const dayOfYear = getDayOfYear(now);
  const totalDays = daysInYear(now.getFullYear());
  const progressPct = Math.min(
    100,
    Math.round((dayOfYear / Math.max(1, totalDays)) * 100),
  );

  const [gridQuotes, setGridQuotes] = useState<MotivationalQuote[]>(() =>
    pickUniqueRandomQuotes(MOTIVATIONAL_QUOTES, QUOTE_GRID_SLOTS),
  );
  const [toast, setToast] = useState<string | null>(null);

  const refreshQuotes = useCallback(() => {
    setGridQuotes(pickUniqueRandomQuotes(MOTIVATIONAL_QUOTES, QUOTE_GRID_SLOTS));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const contextText = useMemo(
    () =>
      `Wall of Wisdom: ${QUOTE_GRID_SLOTS} motivational quote cards. User can ask to shuffle or refresh quotes.`,
    [],
  );

  const toolHandlers = useMemo(
    () => ({
      shuffle_wall_quotes: () => {
        refreshQuotes();
        showToast("Quotes refreshed");
        return "Shuffled all quote slots on the wall. The grid updated without a full page reload.";
      },
    }),
    [refreshQuotes, showToast],
  );

  const aiReg = useMemo(
    () => ({
      route: "/home",
      label: "Wall of Wisdom (Home dashboard)",
      contextText,
      toolHandlers,
    }),
    [contextText, toolHandlers],
  );
  useRegisterAISanctuary(aiReg);

  const q = gridQuotes;
  const [q0, q1, q2, q3, q4] = [q[0], q[1], q[2], q[3], q[4]];

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    document.title = "The Sanctuary — Wall of Wisdom";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-manrope text-slate-100 antialiased">
      <SideNavBar />

      <div className="pl-0 pt-14 lg:pl-64 lg:pt-0">
        <main className="min-w-0 px-4 py-6 pb-36 sm:px-6 sm:py-8 sm:pb-40 lg:px-8">
          <div className="mb-10 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">Dashboard</p>
            <h1 className="text-2xl font-extrabold tracking-tighter text-white sm:text-3xl md:text-4xl">
              Wall of Wisdom
            </h1>
          </div>

          <section className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Current atmosphere</p>
              <p
                className="mt-1 text-5xl font-bold leading-none tracking-tight text-[#f1f3fc] sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                {timeStr}
              </p>
              <p className="mt-3 text-lg font-medium text-slate-400">{formatLongDate(now)}</p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-[#20262f]/60 px-5 py-2.5 shadow-deep backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                Day {dayOfYear} of {totalDays}
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Hero */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f141a] p-8 text-center shadow-deep sm:p-12 lg:col-span-7 lg:row-span-2 lg:min-h-[420px]">
              {q0 && <QuoteCardActions onFavorite={() => showToast("Saved to favorites (preview)")} onShare={() => showToast("Share link copied (preview)")} />}
              <LargeQuoteDecoration />
              <blockquote className="font-serif text-2xl font-light italic leading-snug tracking-tight text-[#f1f3fc] sm:text-3xl md:text-4xl">
                &ldquo;{q0?.text ?? "—"}&rdquo;
              </blockquote>
              <footer className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {q0?.author ?? ""}
              </footer>
            </article>

            {/* Card 2 */}
            <article className="relative flex flex-col justify-center rounded-2xl border border-white/10 bg-[#0f141a] p-8 shadow-deep sm:p-10 lg:col-span-5">
              {q1 && <QuoteCardActions onFavorite={() => showToast("Saved to favorites (preview)")} onShare={() => showToast("Share link copied (preview)")} />}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-light italic leading-relaxed text-slate-200 sm:text-2xl">
                &ldquo;{q1?.text ?? ""}&rdquo;
              </p>
              <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                — {q1?.author ?? ""}
              </p>
            </article>

            {/* Gradient */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/90 via-violet-600/80 to-[#2962FF]/90 p-8 shadow-deep sm:p-12 lg:col-span-5">
              {q2 && <QuoteCardActions onFavorite={() => showToast("Saved to favorites (preview)")} onShare={() => showToast("Share link copied (preview)")} />}
              <div className="mb-6 text-white/90">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light italic leading-relaxed text-white sm:text-2xl md:text-3xl">
                &ldquo;{q2?.text ?? ""}&rdquo;
              </p>
              <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
                {q2?.author ?? ""}
              </p>
            </article>

            {/* Landscape */}
            <article className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 shadow-deep lg:col-span-7">
              {q3 && <QuoteCardActions onFavorite={() => showToast("Saved to favorites (preview)")} onShare={() => showToast("Share link copied (preview)")} />}
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
                  &ldquo;{q3?.text ?? ""}&rdquo;
                </p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                  {q3?.author ?? ""}
                </p>
              </div>
            </article>

            {/* Progress + quote */}
            <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#20262f]/60 p-8 shadow-deep backdrop-blur-xl sm:p-12 lg:col-span-5">
              {q4 && <QuoteCardActions onFavorite={() => showToast("Saved to favorites (preview)")} onShare={() => showToast("Share link copied (preview)")} />}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10rem] font-extrabold leading-none text-white/[0.04] select-none">
                {String(progressPct).padStart(2, "0")}
              </span>
              <div className="relative">
                <p className="font-serif text-xl font-light italic leading-relaxed text-[#f1f3fc] sm:text-2xl">
                  &ldquo;{q4?.text ?? ""}&rdquo;
                </p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{q4?.author ?? ""}</p>
                <div className="mt-10">
                  <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span>Year progress</span>
                    <span className="text-[#94aaff]">{progressPct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#94aaff] to-[#2962FF] shadow-[0_0_16px_rgba(148,170,255,0.5)] transition-[width] duration-500"
                      style={{ width: `${progressPct}%` }}
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

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-[#20262f]/95 px-5 py-2.5 text-sm font-semibold text-[#f1f3fc] shadow-lg backdrop-blur-xl">
          {toast}
        </div>
      )}

      <Link
        to="/"
        onClick={() => signOut()}
        className="fixed bottom-6 left-4 z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-[#2962FF] hover:underline sm:bottom-8 lg:left-[calc(16rem+2rem)] lg:bottom-8"
      >
        Sign out
      </Link>
    </div>
  );
}
