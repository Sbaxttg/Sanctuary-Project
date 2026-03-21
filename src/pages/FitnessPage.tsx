import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { FitnessAICoach } from "../components/fitness/FitnessAICoach";

const STORAGE_GOALS = "sanctuary-fitness-goals-v1";
const STORAGE_WEIGHT = "sanctuary-fitness-weight-series-v1";
const STORAGE_EXERCISES = "sanctuary-fitness-exercises-v1";
const STORAGE_HYDRATION = "sanctuary-fitness-hydration-v1";

type Goal = { id: string; title: string; progress: number };
type Exercise = { id: string; name: string; meta: string; done: boolean };

function formatSessionTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function parseWeightInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseFloat(t.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_GOALS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Goal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadWeightSeries(): (number | null)[] {
  try {
    const raw = localStorage.getItem(STORAGE_WEIGHT);
    if (!raw) return Array(30).fill(null);
    const parsed = JSON.parse(raw) as (number | null)[];
    if (Array.isArray(parsed) && parsed.length === 30) return parsed;
    return Array(30).fill(null);
  } catch {
    return Array(30).fill(null);
  }
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: "ex-1", name: "Barbell Squats", meta: "4 Sets • 8-10 Reps", done: false },
  { id: "ex-2", name: "Leg Press", meta: "3 Sets • 12 Reps", done: false },
  { id: "ex-3", name: "Calf Raises", meta: "5 Sets • 15 Reps", done: false },
];

function loadExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_EXERCISES);
    if (!raw) return DEFAULT_EXERCISES;
    const parsed = JSON.parse(raw) as Exercise[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EXERCISES;
  } catch {
    return DEFAULT_EXERCISES;
  }
}

function loadHydration(): { targetL: number; consumedL: number } {
  try {
    const raw = localStorage.getItem(STORAGE_HYDRATION);
    if (!raw) return { targetL: 3, consumedL: 2.1 };
    const parsed = JSON.parse(raw) as { targetL?: number; consumedL?: number };
    const targetL = typeof parsed.targetL === "number" && parsed.targetL > 0 ? parsed.targetL : 3;
    let consumedL = typeof parsed.consumedL === "number" && parsed.consumedL >= 0 ? parsed.consumedL : 2.1;
    consumedL = Math.min(consumedL, targetL);
    return { targetL, consumedL };
  } catch {
    return { targetL: 3, consumedL: 2.1 };
  }
}

export function FitnessPage() {
  const goalInputRef = useRef<HTMLInputElement>(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());

  const [weightInput, setWeightInput] = useState("");
  const [weightSeries, setWeightSeries] = useState<(number | null)[]>(() => loadWeightSeries());

  const [exercises, setExercises] = useState<Exercise[]>(() => loadExercises());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMeta, setEditMeta] = useState("");

  const [hydrationTargetL, setHydrationTargetL] = useState(() => loadHydration().targetL);
  const [hydrationConsumedL, setHydrationConsumedL] = useState(() => loadHydration().consumedL);

  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    document.title = "Sanctuary — Fitness";
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_WEIGHT, JSON.stringify(weightSeries));
  }, [weightSeries]);

  useEffect(() => {
    if (!sessionActive) return;
    const id = window.setInterval(() => setElapsedSeconds((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [sessionActive]);

  const currentWeightDisplay = useMemo(() => {
    const parsed = parseWeightInput(weightInput);
    if (parsed == null) return null;
    return parsed;
  }, [weightInput]);

  const weightDelta = useMemo(() => {
    const nums = weightSeries.filter((v): v is number => v != null);
    if (nums.length < 2) return null;
    const a = nums[nums.length - 2]!;
    const b = nums[nums.length - 1]!;
    return b - a;
  }, [weightSeries]);

  const chartBars = useMemo(() => {
    const nums = weightSeries.map((v) => (v == null ? null : v));
    const maxVal = Math.max(1, ...nums.filter((v): v is number => v != null), 200);
    return nums.map((w, i) => {
      if (w == null) return { h: 6, highlight: false, i, value: null as number | null };
      const h = Math.max(10, Math.round((w / maxVal) * 72));
      const lastIdx = nums.map((x, j) => (x != null ? j : -1)).filter((j) => j >= 0).pop();
      const highlight = i === lastIdx;
      return { h, highlight, i, value: w };
    });
  }, [weightSeries]);

  const hydrationPercent = useMemo(() => {
    if (hydrationTargetL <= 0) return 0;
    return Math.min(100, (hydrationConsumedL / hydrationTargetL) * 100);
  }, [hydrationConsumedL, hydrationTargetL]);

  const addGoal = useCallback(() => {
    const title = goalDraft.trim();
    if (!title) return;
    setGoals((g) => [...g, { id: `goal-${Date.now()}`, title, progress: 0 }]);
    setGoalDraft("");
  }, [goalDraft]);

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setGoals((g) => g.map((x) => (x.id === id ? { ...x, progress } : x)));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals((g) => g.filter((x) => x.id !== id));
  }, []);

  const logWeight = useCallback(() => {
    const w = parseWeightInput(weightInput);
    if (w == null) return;
    setWeightSeries((prev) => [...prev.slice(1), w] as (number | null)[]);
  }, [weightInput]);

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setEditName(ex.name);
    setEditMeta(ex.meta);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setExercises((list) =>
      list.map((ex) =>
        ex.id === editingId ? { ...ex, name: editName.trim() || ex.name, meta: editMeta.trim() || ex.meta } : ex,
      ),
    );
    setEditingId(null);
  };

  const addExercise = () => {
    const id = `ex-${Date.now()}`;
    setExercises((list) => [...list, { id, name: "New exercise", meta: "Sets • Reps", done: false }]);
    setEditingId(id);
    setEditName("New exercise");
    setEditMeta("Sets • Reps");
  };

  const removeExercise = (id: string) => {
    setExercises((list) => {
      const next = list.filter((e) => e.id !== id);
      return next.length > 0 ? next : DEFAULT_EXERCISES;
    });
    if (editingId === id) setEditingId(null);
  };

  const toggleSession = () => {
    if (!sessionActive) {
      setElapsedSeconds(0);
      setSessionActive(true);
    } else {
      setSessionActive(false);
      setElapsedSeconds(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-white/5 bg-[#0a0e14]/90 px-8 backdrop-blur-xl">
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <p className="text-2xl font-bold tracking-tight text-white">Fitness Sanctuary</p>
              {sessionActive && (
                <div
                  className="flex items-center gap-2 rounded-full border border-app-primary/40 bg-app-primary/10 px-4 py-1.5 font-mono text-sm font-bold tabular-nums text-app-primary shadow-[0_0_20px_rgba(41,98,255,0.35)]"
                  aria-live="polite"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-app-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-app-primary" />
                  </span>
                  Session · {formatSessionTime(elapsedSeconds)}
                </div>
              )}
            </div>
            <div className="flex flex-1 items-center justify-end gap-4">
              <button
                type="button"
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Settings"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <div
                className="ml-1 h-9 w-9 shrink-0 rounded-full ring-2 ring-white/15"
                style={{ background: "linear-gradient(135deg, #2962FF, #1e293b)" }}
                aria-hidden
              />
            </div>
          </header>

          <div className="space-y-8 p-8 pb-40">
            <header className="max-w-6xl">
              <h1 className="text-[3.75rem] font-bold leading-[1.05] tracking-tighter text-[#f1f3fc] md:text-6xl">
                Fitness Sanctuary
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#f1f3fc]/80">
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
                      onClick={() => goalInputRef.current?.focus()}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
                      aria-label="Add goal — focuses input"
                    >
                      +
                    </button>
                  </div>

                  {goals.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 bg-[#151a21]/50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                      No goals yet. Type below and press{" "}
                      <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-xs text-slate-400">
                        Enter
                      </kbd>{" "}
                      to add your first goal.
                    </p>
                  ) : (
                    <ul className="space-y-6">
                      {goals.map((g) => (
                        <li key={g.id} className="rounded-xl border border-white/5 bg-[#151a21]/40 p-4">
                          <div className="flex justify-between gap-2 text-sm font-semibold text-slate-300">
                            <span className="min-w-0 truncate">{g.title}</span>
                            <span className="shrink-0 text-app-primary">{g.progress}%</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#151a21]">
                            <div
                              className="h-full rounded-full bg-app-primary shadow-[0_0_12px_rgba(41,98,255,0.45)]"
                              style={{ width: `${g.progress}%` }}
                            />
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <label className="sr-only" htmlFor={`prog-${g.id}`}>
                              Progress for {g.title}
                            </label>
                            <input
                              id={`prog-${g.id}`}
                              type="range"
                              min={0}
                              max={100}
                              value={g.progress}
                              onChange={(e) => updateGoalProgress(g.id, Number(e.target.value))}
                              className="h-1.5 flex-1 cursor-pointer accent-app-primary"
                            />
                            <button
                              type="button"
                              onClick={() => removeGoal(g.id)}
                              className="shrink-0 text-xs font-semibold text-slate-500 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <input
                    ref={goalInputRef}
                    type="text"
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGoal();
                      }
                    }}
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
                      <p className="text-3xl font-bold tracking-tight text-white">
                        {currentWeightDisplay == null ? (
                          <span className="text-slate-500">— — lbs</span>
                        ) : (
                          <>{currentWeightDisplay} lbs</>
                        )}
                      </p>
                      {weightDelta != null && (
                        <span
                          className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                            weightDelta <= 0
                              ? "bg-red-500/20 text-red-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {weightDelta <= 0 ? "↘" : "↗"} {Math.abs(weightDelta).toFixed(1)} lbs
                        </span>
                      )}
                    </div>
                  </div>

                  <label className="mt-6 block text-xs font-bold uppercase tracking-widest text-[#f1f3fc]/40">
                    Log weight (lbs)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder="e.g. 184.5"
                      className="min-w-[8rem] flex-1 rounded-xl border border-white/10 bg-[#151a21] px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-app-primary/40"
                    />
                    <button
                      type="button"
                      onClick={logWeight}
                      disabled={parseWeightInput(weightInput) == null}
                      className="rounded-xl border border-white/10 bg-app-primary/20 px-4 py-3 text-sm font-bold text-app-primary transition hover:bg-app-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Log entry
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Chart uses up to 30 logged entries (oldest → newest). Empty slots show as placeholders.
                  </p>

                  <div className="mt-8 flex h-28 items-end justify-between gap-0.5 sm:gap-1">
                    {chartBars.map(({ h, highlight, i, value }) => {
                      const tip =
                        value != null
                          ? `${value % 1 === 0 ? value : value.toFixed(1)} lbs logged`
                          : "No entry";
                      return (
                        <div
                          key={i}
                          className="group relative flex min-w-0 flex-1 flex-col items-center"
                        >
                          <div
                            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#151a21] px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover:opacity-100"
                            role="tooltip"
                          >
                            {tip}
                          </div>
                          <div className="relative flex h-full w-full flex-col items-center justify-end">
                            {highlight && weightSeries.some((v) => v != null) && (
                              <span className="absolute -top-1.5 h-2 w-2 rounded-full bg-[#94aaff] shadow-[0_0_12px_rgba(148,170,255,0.9)]" />
                            )}
                            <button
                              type="button"
                              title={tip}
                              className="flex h-full w-full flex-col items-center justify-end border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
                              aria-label={tip}
                            >
                              <div
                                className={
                                  highlight && weightSeries.filter((v) => v != null).length > 0
                                    ? "w-full max-w-[10px] rounded-t-md bg-[#94aaff] shadow-[0_0_16px_rgba(148,170,255,0.4)] sm:max-w-none"
                                    : "w-full max-w-[10px] rounded-t-md bg-app-primary/20 sm:max-w-none"
                                }
                                style={{ height: `${h}px` }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h2 className="text-2xl font-bold tracking-tight text-white">Active Routine</h2>
                      <button
                        type="button"
                        onClick={addExercise}
                        className="rounded-full border border-app-primary/40 bg-app-primary/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-app-primary transition hover:bg-app-primary/25"
                      >
                        + Add workout
                      </button>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {exercises.map((ex) => (
                        <li
                          key={ex.id}
                          className="flex flex-col gap-3 rounded-xl border border-white/5 bg-[#0a0e14] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <input
                              type="checkbox"
                              checked={ex.done}
                              onChange={() =>
                                setExercises((list) =>
                                  list.map((e) => (e.id === ex.id ? { ...e, done: !e.done } : e)),
                                )
                              }
                              className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-[#151a21] text-app-primary focus:ring-app-primary"
                              aria-label={`Done: ${ex.name}`}
                            />
                            {editingId === ex.id ? (
                              <div className="min-w-0 flex-1 space-y-2">
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full rounded-lg border border-white/10 bg-[#151a21] px-3 py-2 text-sm font-bold text-white outline-none focus:border-app-primary/40"
                                  placeholder="Exercise name"
                                />
                                <input
                                  value={editMeta}
                                  onChange={(e) => setEditMeta(e.target.value)}
                                  className="w-full rounded-lg border border-white/10 bg-[#151a21] px-3 py-2 text-xs text-slate-300 outline-none focus:border-app-primary/40"
                                  placeholder="Sets / reps"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={saveEdit}
                                    className="rounded-lg bg-app-primary px-3 py-1.5 text-xs font-bold text-white"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-bold text-white ${ex.done ? "text-slate-500 line-through" : ""}`}
                                >
                                  {ex.name}
                                </p>
                                <p className={`mt-1 text-xs text-slate-500 ${ex.done ? "line-through" : ""}`}>
                                  {ex.meta}
                                </p>
                              </div>
                            )}
                          </div>
                          {editingId !== ex.id && (
                            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => startEdit(ex)}
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExercise(ex.id)}
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-red-500/40 hover:text-red-400"
                              >
                                Remove
                              </button>
                              {exercises[0]?.id === ex.id && (
                                <svg
                                  className="h-5 w-5 shrink-0 text-slate-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={toggleSession}
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#94aaff] py-4 text-sm font-bold text-[#0a0e14] shadow-[0_8px_28px_rgba(148,170,255,0.35)] transition hover:scale-105 hover:shadow-[0_12px_36px_rgba(148,170,255,0.4)] active:scale-100"
                    >
                      {sessionActive ? (
                        <>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path d="M6 6h12v12H6z" />
                          </svg>
                          Finish session
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Begin workout session
                        </>
                      )}
                    </button>
                  </div>
                </article>
              </div>

              {/* Column 3 — Hydration */}
              <div className="space-y-6 xl:col-span-4">
                <h2 className="text-2xl font-bold tracking-tight text-white">Holistic Stats</h2>
                <div className="rounded-2xl border border-white/5 bg-[#0a0e14] p-6">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="text-2xl" aria-hidden>
                      💧
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white">Hydration</p>
                      <p className="mt-1 text-sm text-slate-400">
                        <span className="font-semibold text-white">
                          {hydrationConsumedL % 1 === 0
                            ? hydrationConsumedL
                            : hydrationConsumedL.toFixed(1)}
                          L
                        </span>{" "}
                        /{" "}
                        <label className="inline-flex items-center gap-1.5">
                          <span className="sr-only">Daily target in liters</span>
                          <input
                            type="number"
                            min={0.5}
                            max={20}
                            step={0.1}
                            value={hydrationTargetL}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!Number.isFinite(v) || v < 0.5) return;
                              setHydrationTargetL(v);
                              setHydrationConsumedL((c) => Math.min(c, v));
                            }}
                            className="w-16 rounded-md border border-white/10 bg-[#151a21] px-2 py-1 text-center text-sm font-bold text-white outline-none focus:border-app-primary/40"
                          />
                          <span className="text-slate-500">L daily target</span>
                        </label>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#f1f3fc]/40" htmlFor="hydration-slider">
                      Water consumed today
                    </label>
                    <div className="mt-3 flex items-center gap-4">
                      <input
                        id="hydration-slider"
                        type="range"
                        min={0}
                        max={hydrationTargetL}
                        step={0.1}
                        value={hydrationConsumedL}
                        onChange={(e) => setHydrationConsumedL(Number(e.target.value))}
                        className="h-2 flex-1 cursor-pointer accent-sky-400"
                      />
                      <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-sky-300">
                        {hydrationPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#151a21]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-[width] duration-150"
                      style={{ width: `${hydrationPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
