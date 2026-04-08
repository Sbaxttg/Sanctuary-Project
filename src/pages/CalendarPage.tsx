import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "../lib/auth";
import { storageGet, storageSet } from "../lib/sanctuaryStorage";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { useRegisterAISanctuary } from "../context/AISanctuaryContext";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const STORAGE_EVENTS = "sanctuary-calendar-events-v1";
const STORAGE_TASKS = "sanctuary-calendar-tasks-v1";
const STORAGE_MILESTONES = "sanctuary-calendar-milestones-v2";
const STORAGE_MILESTONE_LEGACY = "sanctuary-calendar-milestone-v1";
const STORAGE_COLLAB = "sanctuary-calendar-collab-v1";

const EVENT_STYLES = [
  "bg-[#2962FF] font-bold text-white shadow-sm",
  "bg-violet-600/90 text-white shadow-sm",
  "bg-teal-600/90 text-white shadow-sm",
  "bg-cyan-600/85 text-white shadow-sm",
  "bg-amber-600/85 text-white shadow-sm",
] as const;

type CalendarEvent = {
  id: string;
  dateKey: string;
  title: string;
  colorIndex: number;
};

type CalendarTask = {
  id: string;
  title: string;
  done: boolean;
  priority: "high" | "med" | "low";
  /** `yyyy-mm-dd` or null if no due date */
  dueDate: string | null;
};

type CalendarView = "month" | "week" | "day";

function dateKeyFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function loadEvents(): CalendarEvent[] {
  try {
    const raw = storageGet(STORAGE_EVENTS);
    if (!raw) return [];
    const p = JSON.parse(raw) as CalendarEvent[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function migrateTask(raw: unknown): CalendarTask | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  const id = String(t.id ?? "");
  if (!id) return null;
  const title = String(t.title ?? "");
  const done = Boolean(t.done);
  const priority =
    t.priority === "high" || t.priority === "med" || t.priority === "low" ? t.priority : "low";
  let dueDate: string | null = null;
  if (typeof t.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)) {
    dueDate = t.dueDate;
  }
  return { id, title, done, priority, dueDate };
}

function loadTasks(): CalendarTask[] {
  try {
    const raw = storageGet(STORAGE_TASKS);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown[];
    if (!Array.isArray(p)) return [];
    return p.map(migrateTask).filter((x): x is CalendarTask => x != null);
  } catch {
    return [];
  }
}

type MilestoneItem = { id: string; title: string };

function loadMilestones(): MilestoneItem[] {
  try {
    const raw = storageGet(STORAGE_MILESTONES);
    if (raw) {
      const p = JSON.parse(raw) as unknown;
      if (Array.isArray(p)) {
        const items: MilestoneItem[] = [];
        for (const x of p) {
          if (!x || typeof x !== "object") continue;
          const o = x as Record<string, unknown>;
          const id = String(o.id ?? "");
          const title = String(o.title ?? "").trim();
          if (id && title) items.push({ id, title });
        }
        return items;
      }
    }
    const legacy = storageGet(STORAGE_MILESTONE_LEGACY);
    if (legacy && legacy.trim()) {
      return [{ id: `ms-legacy-${Date.now()}`, title: legacy.trim() }];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function formatTaskDueLine(dueDate: string | null): string {
  if (!dueDate) return "No due date";
  const d = new Date(dueDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return "No due date";
  return `Due ${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

type Cell =
  | { kind: "empty" }
  | { kind: "day"; day: number; dateKey: string; isToday: boolean };

function buildMonthCells(year: number, month: number): Cell[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ kind: "empty" });
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = dateKeyFromParts(year, month, d);
    const isToday =
      today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    cells.push({ kind: "day", day: d, dateKey, isToday });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
  return cells;
}

export function CalendarPage() {
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents());
  const [tasks, setTasks] = useState<CalendarTask[]>(() => loadTasks());
  const [taskDraft, setTaskDraft] = useState("");
  /** yyyy-mm-dd for new task; empty = no due date */
  const [taskDueDate, setTaskDueDate] = useState("");
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => loadMilestones());
  const [milestoneDraft, setMilestoneDraft] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneEditDraft, setMilestoneEditDraft] = useState("");
  const [collaboratorCount, setCollaboratorCount] = useState(() => {
    try {
      const n = parseInt(storageGet(STORAGE_COLLAB) || "0", 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch {
      return 0;
    }
  });
  const [eventSearch, setEventSearch] = useState("");

  const [modal, setModal] = useState<
    | null
    | { mode: "add"; dateKey: string }
    | { mode: "edit"; event: CalendarEvent }
  >(null);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    document.title = "The Sanctuary — Calendar";
  }, []);

  useEffect(() => {
    storageSet(STORAGE_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    storageSet(STORAGE_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    try {
      storageSet(STORAGE_MILESTONES, JSON.stringify(milestones));
    } catch {
      /* ignore */
    }
  }, [milestones]);

  useEffect(() => {
    try {
      storageSet(STORAGE_COLLAB, String(collaboratorCount));
    } catch {
      /* ignore */
    }
  }, [collaboratorCount]);

  const year = cursorDate.getFullYear();
  const month = cursorDate.getMonth();

  const eventsForMonth = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return events.filter((e) => e.dateKey.startsWith(prefix));
  }, [events, year, month]);

  const eventCount = eventsForMonth.length;

  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, eventSearch]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of filteredEvents) {
      const list = map.get(e.dateKey) ?? [];
      list.push(e);
      map.set(e.dateKey, list);
    }
    return map;
  }, [filteredEvents]);

  const monthCells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const navigate = useCallback((delta: number) => {
    setCursorDate((d) => {
      const n = new Date(d);
      if (view === "month") {
        n.setMonth(n.getMonth() + delta);
      } else if (view === "week") {
        n.setDate(n.getDate() + delta * 7);
      } else {
        n.setDate(n.getDate() + delta);
      }
      return n;
    });
  }, [view]);

  const goToday = useCallback(() => setCursorDate(new Date()), []);

  const monthYearLabel = useMemo(
    () =>
      cursorDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [cursorDate],
  );

  const addEventForAi = useCallback((title: string, dateKey: string) => {
    setEvents((list) => [
      ...list,
      {
        id: `ev-${Date.now()}`,
        dateKey,
        title,
        colorIndex: list.length % EVENT_STYLES.length,
      },
    ]);
  }, []);

  const calendarAiContext = useMemo(
    () =>
      `Sanctuary Calendar — ${monthYearLabel}. ${events.length} total events. Current month shows ${eventCount} events. Tasks: ${tasks.length}. Milestones: ${milestones.length}.`,
    [monthYearLabel, events.length, eventCount, tasks.length, milestones.length],
  );

  const calendarToolHandlers = useMemo(
    () => ({
      create_calendar_event: (args: Record<string, unknown>) => {
        const title = String(args.title ?? "").trim();
        const dateKey = String(args.dateKey ?? "").trim();
        if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
          return "Invalid arguments: need non-empty title and dateKey as yyyy-mm-dd.";
        }
        addEventForAi(title, dateKey);
        return `Created calendar event "${title}" on ${dateKey}. It appears on the grid immediately.`;
      },
    }),
    [addEventForAi],
  );

  const calendarAiReg = useMemo(
    () => ({
      route: "/calendar",
      label: "Sanctuary Calendar",
      contextText: calendarAiContext,
      toolHandlers: calendarToolHandlers,
    }),
    [calendarAiContext, calendarToolHandlers],
  );
  useRegisterAISanctuary(calendarAiReg);

  const openAdd = (dateKey: string) => {
    setModal({ mode: "add", dateKey });
    setModalTitle("");
  };

  const openEdit = (ev: CalendarEvent) => {
    setModal({ mode: "edit", event: ev });
    setModalTitle(ev.title);
  };

  const saveModal = () => {
    const title = modalTitle.trim();
    if (!modal || !title) return;
    if (modal.mode === "add") {
      setEvents((list) => [
        ...list,
        {
          id: `ev-${Date.now()}`,
          dateKey: modal.dateKey,
          title,
          colorIndex: list.length % EVENT_STYLES.length,
        },
      ]);
    } else {
      setEvents((list) =>
        list.map((e) => (e.id === modal.event.id ? { ...e, title } : e)),
      );
    }
    setModal(null);
  };

  const deleteEvent = () => {
    if (!modal || modal.mode !== "edit") return;
    setEvents((list) => list.filter((e) => e.id !== modal.event.id));
    setModal(null);
  };

  const addTask = useCallback(() => {
    const title = taskDraft.trim();
    if (!title) return;
    const due = taskDueDate.trim();
    const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
    setTasks((t) => [
      ...t,
      {
        id: `task-${Date.now()}`,
        title,
        done: false,
        priority: "low",
        dueDate,
      },
    ]);
    setTaskDraft("");
    setTaskDueDate("");
  }, [taskDraft, taskDueDate]);

  const updateTaskDueDate = (id: string, value: string) => {
    const dueDate = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    setTasks((list) => list.map((x) => (x.id === id ? { ...x, dueDate } : x)));
  };

  const addMilestone = useCallback(() => {
    const title = milestoneDraft.trim();
    if (!title) return;
    setMilestones((m) => [...m, { id: `ms-${Date.now()}`, title }]);
    setMilestoneDraft("");
  }, [milestoneDraft]);

  const removeMilestone = (id: string) => {
    setMilestones((m) => m.filter((x) => x.id !== id));
    if (editingMilestoneId === id) {
      setEditingMilestoneId(null);
      setMilestoneEditDraft("");
    }
  };

  const startEditMilestone = (item: MilestoneItem) => {
    setEditingMilestoneId(item.id);
    setMilestoneEditDraft(item.title);
  };

  const saveMilestoneEdit = () => {
    if (!editingMilestoneId) return;
    const title = milestoneEditDraft.trim();
    if (!title) {
      cancelMilestoneEdit();
      return;
    }
    setMilestones((m) =>
      m.map((x) => (x.id === editingMilestoneId ? { ...x, title } : x)),
    );
    setEditingMilestoneId(null);
    setMilestoneEditDraft("");
  };

  const cancelMilestoneEdit = () => {
    setEditingMilestoneId(null);
    setMilestoneEditDraft("");
  };

  const toggleTask = (id: string) => {
    setTasks((list) => list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const removeTask = (id: string) => {
    setTasks((list) => list.filter((x) => x.id !== id));
  };

  const remainingTasks = tasks.filter((t) => !t.done).length;

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursorDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursorDate]);

  const priorityClass = (p: CalendarTask["priority"]) =>
    p === "high"
      ? "bg-red-500/20 text-red-300"
      : p === "med"
        ? "bg-violet-500/25 text-violet-300"
        : "bg-slate-500/20 text-slate-400";

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen flex-col pl-0 pt-14 lg:pl-64 lg:pt-0">
        <header className="sticky top-0 z-20 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-[#0a0e14]/80 px-4 py-3 backdrop-blur-xl sm:gap-6 sm:px-8">
          <div className="flex min-w-0 flex-wrap items-baseline gap-3">
            <h1 className="text-lg font-bold tracking-tight text-white">Sanctuary Calendar</h1>
            <span className="text-sm font-medium text-slate-500">{monthYearLabel}</span>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 md:gap-4">
            <div className="hidden max-w-xs flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-2 md:flex">
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="Search events..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={goToday}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/5"
            >
              Today
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pb-36 sm:gap-8 sm:p-6 sm:pb-40 xl:flex-row xl:p-8">
          <div className="min-w-0 flex-1 space-y-8">
            <section className="rounded-3xl border border-white/5 bg-[#151a21] p-6 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.5)] md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                      Monthly Schedule
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {eventCount === 0
                        ? "No events scheduled this month yet."
                        : `You have ${eventCount} event${eventCount === 1 ? "" : "s"} scheduled this month.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0e14]/80 p-1">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="rounded-full px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
                      aria-label="Previous"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(1)}
                      className="rounded-full px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
                      aria-label="Next"
                    >
                      →
                    </button>
                  </div>
                </div>
                <div className="inline-flex rounded-full border border-white/10 bg-[#0a0e14]/80 p-1">
                  {(["month", "week", "day"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={
                        view === v
                          ? "rounded-full bg-[#2962FF] px-5 py-2 text-[13px] font-bold text-white shadow-[0_0_20px_rgba(41,98,255,0.35)]"
                          : "rounded-full px-5 py-2 text-[13px] font-semibold text-slate-500 transition hover:text-slate-300"
                      }
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {view === "month" && (
                <>
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
                    {monthCells.map((cell, idx) => {
                      if (cell.kind === "empty") {
                        return (
                          <div
                            key={`e-${idx}`}
                            className="min-h-[120px] border-b border-r border-white/5 bg-[#0a0e14]/30"
                          />
                        );
                      }
                      const { day, dateKey, isToday } = cell;
                      const dayEvents = eventsByDate.get(dateKey) ?? [];
                      return (
                        <div
                          key={dateKey}
                          role="button"
                          tabIndex={0}
                          onClick={() => openAdd(dateKey)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openAdd(dateKey);
                            }
                          }}
                          className={[
                            "flex min-h-[120px] w-full flex-col border-b border-r border-white/5 p-2 text-left outline-none transition hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-app-primary",
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
                            {dayEvents.map((ev) => (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(ev);
                                }}
                                className={`truncate rounded-full px-2 py-0.5 text-left text-[9px] font-bold ${EVENT_STYLES[ev.colorIndex % EVENT_STYLES.length]}`}
                              >
                                {ev.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {view === "week" && (
                <div className="mt-8 grid gap-4 md:grid-cols-7">
                  {weekDays.map((d) => {
                    const dk = dateKeyFromParts(d.getFullYear(), d.getMonth(), d.getDate());
                    const list = eventsByDate.get(dk) ?? [];
                    const isToday =
                      new Date().toDateString() === new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
                    return (
                      <div
                        key={dk}
                        className={`min-h-[200px] rounded-2xl border border-white/5 p-3 ${
                          isToday ? "bg-[#2962FF]/10 ring-1 ring-[#2962FF]" : "bg-[#0a0e14]"
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {d.toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                        <p className="text-lg font-bold text-white">{d.getDate()}</p>
                        <button
                          type="button"
                          onClick={() => openAdd(dk)}
                          className="mt-2 text-[10px] font-bold text-app-primary hover:underline"
                        >
                          + Add
                        </button>
                        <ul className="mt-3 space-y-2">
                          {list.map((ev) => (
                            <li key={ev.id}>
                              <button
                                type="button"
                                onClick={() => openEdit(ev)}
                                className={`w-full truncate rounded-lg px-2 py-1 text-left text-[10px] font-bold ${EVENT_STYLES[ev.colorIndex % EVENT_STYLES.length]}`}
                              >
                                {ev.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === "day" && (
                <div className="mt-8 rounded-2xl border border-white/5 bg-[#0a0e14] p-6">
                  <p className="text-sm font-medium text-slate-500">
                    {cursorDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openAdd(dateKeyFromParts(cursorDate.getFullYear(), cursorDate.getMonth(), cursorDate.getDate()))
                    }
                    className="mt-4 rounded-full bg-[#2962FF] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_20px_rgba(41,98,255,0.4)]"
                  >
                    Add event
                  </button>
                  <ul className="mt-6 space-y-2">
                    {(eventsByDate.get(
                      dateKeyFromParts(cursorDate.getFullYear(), cursorDate.getMonth(), cursorDate.getDate()),
                    ) ?? []
                    ).map((ev) => (
                      <li key={ev.id}>
                        <button
                          type="button"
                          onClick={() => openEdit(ev)}
                          className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold ${EVENT_STYLES[ev.colorIndex % EVENT_STYLES.length]}`}
                        >
                          {ev.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-400/25 via-indigo-500/20 to-app-primary/25 p-6 shadow-lg md:p-8">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sky-200">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 2l3.09 6.26L22 9l-6.91 1.01L12 16l-3.09-6.99L2 9l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Next big milestone</span>
                  </div>
                </div>
                {milestones.length === 0 ? (
                  <p className="mt-4 text-sm font-medium text-[#0a0e14]/70">
                    No milestones yet — add one below.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {milestones.map((ms) => (
                      <li
                        key={ms.id}
                        className="rounded-xl border border-[#0a0e14]/15 bg-white/80 p-3 shadow-sm"
                      >
                        {editingMilestoneId === ms.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={milestoneEditDraft}
                              onChange={(e) => setMilestoneEditDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveMilestoneEdit();
                                }
                                if (e.key === "Escape") cancelMilestoneEdit();
                              }}
                              className="w-full rounded-lg border border-[#0a0e14]/20 bg-white px-3 py-2 text-sm font-medium text-[#0a0e14] outline-none focus:ring-2 focus:ring-app-primary/40"
                              autoFocus
                              aria-label="Edit milestone"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={saveMilestoneEdit}
                                className="rounded-full bg-[#2962FF] px-3 py-1.5 text-xs font-bold text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelMilestoneEdit}
                                className="rounded-full border border-[#0a0e14]/20 px-3 py-1.5 text-xs font-semibold text-[#0a0e14]/70"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 text-base font-bold leading-snug tracking-tight text-[#0a0e14]">
                              {ms.title}
                            </p>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => startEditMilestone(ms)}
                                className="rounded-lg px-2 py-1 text-xs font-bold text-[#0a0e14]/70 hover:bg-[#0a0e14]/10"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMilestone(ms.id)}
                                className="rounded-lg px-2 py-1 text-xs font-bold text-red-700/80 hover:bg-red-500/15"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#0a0e14]/60" htmlFor="milestone-add">
                    Add milestone
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="milestone-add"
                      type="text"
                      value={milestoneDraft}
                      onChange={(e) => setMilestoneDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMilestone();
                        }
                      }}
                      placeholder="Describe a milestone…"
                      className="min-w-0 flex-1 rounded-xl border border-[#0a0e14]/20 bg-white/90 px-4 py-3 text-sm font-medium text-[#0a0e14] placeholder:text-[#0a0e14]/40 outline-none focus:ring-2 focus:ring-app-primary/40"
                    />
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="shrink-0 rounded-xl bg-[#0a0e14] px-4 py-3 text-sm font-bold text-white hover:bg-[#151a21]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[#151a21] p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Collaborators</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(collaboratorCount, 5) }).map((_, i) => (
                      <div
                        key={i}
                        className="h-9 w-9 rounded-full border-2 border-[#151a21] ring-2 ring-white/10"
                        style={{
                          background: `linear-gradient(135deg, hsl(${(i * 60) % 360}, 70%, 50%), #1e293b)`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    {collaboratorCount === 0
                      ? "0 active members on this week’s tasks"
                      : `${collaboratorCount} active member${collaboratorCount === 1 ? "" : "s"} on this week’s tasks`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCollaboratorCount((c) => Math.min(99, c + 1))}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-app-primary hover:bg-white/5"
                  >
                    + Invite
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="w-full shrink-0 rounded-2xl border border-white/10 bg-[#151a21]/80 p-6 shadow-deep backdrop-blur-xl xl:w-80">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold tracking-tight text-white">Tasks due</h3>
              <span className="rounded-full bg-app-primary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                {remainingTasks} remaining
              </span>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskDraft}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTask();
                    }
                  }}
                  placeholder="Quick add task..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0a0e14] px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-app-primary/40"
                />
                <button
                  type="button"
                  onClick={addTask}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2962FF] font-bold text-white shadow-[0_4px_16px_rgba(41,98,255,0.45)]"
                  aria-label="Add task"
                >
                  +
                </button>
              </div>
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500" htmlFor="task-due-date">
                  Due date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-[#0a0e14] px-3 py-2 text-sm font-medium text-white outline-none focus:border-app-primary/40 [color-scheme:dark]"
                />
              </div>
              <p className="text-[11px] text-slate-500">Leave due date empty if there’s no deadline.</p>
            </div>
            {tasks.length === 0 ? (
              <p className="mt-8 rounded-xl border border-dashed border-white/10 bg-[#0a0e14]/50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                No tasks due today. Add one above.
              </p>
            ) : (
              <ul className="mt-8 space-y-4">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`rounded-xl border border-white/5 bg-[#0a0e14] p-4 ${task.done ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-app-primary"
                        aria-label={`Done: ${task.title}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${priorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`text-sm font-bold text-white ${task.done ? "line-through text-slate-500" : ""}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <p className="text-xs text-slate-400">{formatTaskDueLine(task.dueDate)}</p>
                          <label className="sr-only" htmlFor={`due-${task.id}`}>
                            Due date for {task.title}
                          </label>
                          <input
                            id={`due-${task.id}`}
                            type="date"
                            value={task.dueDate ?? ""}
                            onChange={(e) => updateTaskDueDate(task.id, e.target.value)}
                            className="max-w-[11rem] rounded-lg border border-white/10 bg-[#151a21] px-2 py-1 text-xs font-medium text-white [color-scheme:dark]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="mt-2 text-xs font-semibold text-slate-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cal-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151a21] p-6 shadow-2xl">
            <h2 id="cal-modal-title" className="text-lg font-bold text-white">
              {modal.mode === "add" ? "Add event" : "Edit event"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {modal.mode === "add" ? modal.dateKey : modal.event.dateKey}
            </p>
            <input
              type="text"
              value={modalTitle}
              onChange={(e) => setModalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveModal();
                }
              }}
              placeholder="Event title"
              className="mt-4 w-full rounded-xl border border-white/10 bg-[#0a0e14] px-4 py-3 text-sm font-medium text-white outline-none focus:border-app-primary/40"
              autoFocus
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveModal}
                className="rounded-full bg-[#2962FF] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(41,98,255,0.4)]"
              >
                Save
              </button>
              {modal.mode === "edit" && (
                <button
                  type="button"
                  onClick={deleteEvent}
                  className="rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Link
        to="/"
        onClick={() => signOut()}
        className="fixed bottom-6 left-4 z-30 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-app-primary hover:underline sm:bottom-8 xl:left-[calc(16rem+2rem)] xl:bottom-8"
      >
        Sign out
      </Link>
    </div>
  );
}
