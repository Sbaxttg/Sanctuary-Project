import { useEffect } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { FitnessAICoach } from "../components/fitness/FitnessAICoach";
import { FitnessSideRail } from "../components/fitness/FitnessSideRail";
import { FitnessTopNav } from "../components/fitness/FitnessTopNav";

/** Bar heights (px) — last bar highlighted per design */
const WEIGHT_BAR_HEIGHTS = [36, 48, 42, 46, 44, 50, 72];

export function FitnessPage() {
  useEffect(() => {
    document.title = "Sanctuary — Fitness";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <FitnessTopNav />
      <FitnessSideRail />

      <main className="min-h-screen pt-14 pl-64">
        <div className="space-y-8 p-8 pb-40">
          <header className="max-w-6xl">
            <h1 className="text-[3.75rem] font-bold leading-[1.05] tracking-tighter text-[#f1f3fc] md:text-6xl">
              Fitness Sanctuary
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              Elevate your physical existence. Precision tracking meets elite performance within your
              digital safe haven.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            {/* Column 1 — Goals + Weight */}
            <div className="space-y-8 xl:col-span-3">
              <section className="rounded-xl border border-white/5 bg-[#0a0e14] p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight text-white">My Goals</h2>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
                    aria-label="Add goal"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-slate-300">
                      <span>Run a 5k</span>
                      <span className="text-app-primary">75%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#151a21]">
                      <div className="h-full w-[75%] rounded-full bg-app-primary shadow-[0_0_12px_rgba(41,98,255,0.45)]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-slate-300">
                      <span>Bench 200lbs</span>
                      <span className="text-app-primary">40%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#151a21]">
                      <div className="h-full w-[40%] rounded-full bg-app-primary shadow-[0_0_12px_rgba(41,98,255,0.45)]" />
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Add new goal..."
                  className="mt-6 w-full rounded-xl border border-white/10 bg-[#151a21] px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-app-primary/40"
                />
              </section>

              <section className="rounded-xl border border-white/5 bg-[#0a0e14] p-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Weight Tracker</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#f1f3fc]/40">
                  Last 30 days trend
                </p>
                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-white">184.5 lbs</p>
                    <span className="mt-2 inline-flex items-center rounded-md bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-300">
                      ↘ 2.4 lbs
                    </span>
                  </div>
                </div>
                <div className="mt-8 flex h-28 items-end justify-between gap-2">
                  {WEIGHT_BAR_HEIGHTS.map((h, i) => (
                    <div key={i} className="flex min-w-0 flex-1 flex-col items-center">
                      <div className="relative flex h-full w-full flex-col items-center justify-end">
                        {i === WEIGHT_BAR_HEIGHTS.length - 1 && (
                          <span className="absolute -top-1.5 h-2 w-2 rounded-full bg-[#94aaff] shadow-[0_0_12px_rgba(148,170,255,0.9)]" />
                        )}
                        <div
                          className={
                            i === WEIGHT_BAR_HEIGHTS.length - 1
                              ? "w-full rounded-t-md bg-[#94aaff] shadow-[0_0_16px_rgba(148,170,255,0.4)]"
                              : "w-full rounded-t-md bg-app-primary/20"
                          }
                          style={{ height: `${h}px` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Column 2 — Active routine */}
            <div className="xl:col-span-5">
              <article className="overflow-hidden rounded-2xl border border-white/5 bg-[#151a21] shadow-deep">
                <div
                  className="relative h-56 bg-cover bg-center md:h-64"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/50 to-transparent" />
                  <div className="absolute left-6 top-6">
                    <span className="rounded-full bg-app-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                      Day 4: Hypertrophy
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Active Routine</h2>
                  <ul className="mt-6 space-y-3">
                    {[
                      { name: "Barbell Squats", meta: "4 Sets • 8-10 Reps", arrow: true },
                      { name: "Leg Press", meta: "3 Sets • 12 Reps", arrow: false },
                      { name: "Calf Raises", meta: "5 Sets • 15 Reps", arrow: false },
                    ].map((ex) => (
                      <li
                        key={ex.name}
                        className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#0a0e14] px-4 py-4"
                      >
                        <div>
                          <p className="font-bold text-white">{ex.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{ex.meta}</p>
                        </div>
                        {ex.arrow && (
                          <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#94aaff] py-4 text-sm font-bold text-[#0a0e14] shadow-[0_8px_28px_rgba(148,170,255,0.35)] transition hover:brightness-105"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Begin workout session
                  </button>
                </div>
              </article>
            </div>

            {/* Column 3 — Holistic + spacing for AI */}
            <div className="space-y-6 xl:col-span-4">
              <h2 className="text-2xl font-bold tracking-tight text-white">Holistic Stats</h2>
              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-[#151a21] p-6 shadow-[0_0_40px_-10px_rgba(139,92,246,0.35)]">
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden>
                    🌙
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-400">Recovery</p>
                    <p className="mt-1 text-4xl font-bold tracking-tight text-white">
                      84 <span className="text-2xl font-semibold text-slate-500">/ 100</span>
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Sleep quality and HRV are trending up — ideal for heavy lower-body volume.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0a0e14] p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    💧
                  </span>
                  <div>
                    <p className="font-bold text-white">Hydration</p>
                    <p className="mt-1 text-sm text-slate-500">2.1L / 3.0L daily target</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#151a21]">
                  <div className="h-full w-[70%] rounded-full bg-sky-500/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FitnessAICoach />

      <Link
        to="/"
        onClick={() => clearDevBypass()}
        className="fixed bottom-8 left-[calc(16rem+2rem)] z-30 text-xs font-semibold text-slate-500 underline-offset-4 hover:text-app-primary hover:underline max-md:left-4"
      >
        Sign out (preview)
      </Link>
    </div>
  );
}
