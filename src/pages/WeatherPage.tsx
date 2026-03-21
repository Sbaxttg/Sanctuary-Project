import { useEffect } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { WeatherAIWidget } from "../components/weather/WeatherAIWidget";

const HOURLY = [
  { label: "12 AM", temp: "14°", active: false },
  { label: "3 AM", temp: "13°", active: false },
  { label: "6 AM", temp: "15°", active: true },
  { label: "9 AM", temp: "17°", active: false },
  { label: "12 PM", temp: "18°", active: false },
  { label: "3 PM", temp: "17°", active: false },
  { label: "6 PM", temp: "16°", active: false },
  { label: "9 PM", temp: "15°", active: false },
] as const;

const WEEKLY = [
  { day: "Tomorrow", date: "Oct 25", condition: "Sunny", low: 9, high: 16, precip: 5, icon: "sun" },
  { day: "Wednesday", date: "Oct 26", condition: "Cloudy", low: 10, high: 15, precip: 20, icon: "cloud" },
  { day: "Thursday", date: "Oct 27", condition: "Rain", low: 8, high: 13, precip: 65, icon: "rain" },
  { day: "Friday", date: "Oct 28", condition: "Cloudy", low: 9, high: 14, precip: 15, icon: "cloud" },
  { day: "Saturday", date: "Oct 29", condition: "Sunny", low: 7, high: 15, precip: 0, icon: "sun" },
  { day: "Sunday", date: "Oct 30", condition: "Partly cloudy", low: 8, high: 14, precip: 10, icon: "partly" },
  { day: "Monday", date: "Oct 31", condition: "Clear", low: 6, high: 13, precip: 0, icon: "sun" },
] as const;

function WeatherGlyph({ type }: { type: string }) {
  if (type === "sun")
    return (
      <svg className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  if (type === "rain")
    return (
      <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  if (type === "partly")
    return (
      <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  return (
    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function BigCloud() {
  return (
    <svg
      className="h-32 w-32 text-white/90 md:h-40 md:w-40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.25}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  );
}

export function WeatherPage() {
  useEffect(() => {
    document.title = "Sanctuary — Weather";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        {/* Pane 2 — main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-6 border-b border-white/5 bg-[#0a0e14]/90 px-8 backdrop-blur-xl">
            <h1 className="text-2xl font-bold tracking-tight text-white">Weather Hub</h1>
            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="hidden max-w-xs flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#0c1016] px-4 py-2 md:flex">
                <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search city..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
                />
              </div>
              <button type="button" className="rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Notifications">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button type="button" className="rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Settings">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </header>

          <div className="space-y-8 p-8 pb-24">
            {/* Hero */}
            <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-deep md:p-10">
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Current sanctuary
              </div>
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-5xl font-bold tracking-tight text-white md:text-6xl">London, UK</h2>
                  <p className="mt-3 text-xl font-semibold text-slate-400">Monday, 24th October</p>
                  <p
                    className="mt-4 font-bold leading-none tracking-tighter text-white"
                    style={{ fontSize: "clamp(5rem, 14vw, 10rem)" }}
                  >
                    18°C
                  </p>
                </div>
                <div className="flex flex-col items-center lg:items-end">
                  <BigCloud />
                  <p className="mt-4 text-lg font-semibold text-slate-300">Partly Cloudy</p>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-sky-400">◇</span> Wind
                  </p>
                  <p className="mt-2 text-lg font-bold text-sky-100">12 km/h</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-cyan-400">◆</span> Humidity
                  </p>
                  <p className="mt-2 text-lg font-bold text-cyan-100">64%</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-indigo-400">◎</span> Visibility
                  </p>
                  <p className="mt-2 text-lg font-bold text-indigo-100">10 km</p>
                </div>
              </div>
            </section>

            {/* Hourly */}
            <section>
              <h3 className="text-xl font-bold tracking-tight text-white">Hourly temperature</h3>
              <div className="mt-6 flex items-end justify-between gap-2 overflow-x-auto pb-2">
                {HOURLY.map((h) => (
                  <div key={h.label} className="flex min-w-[52px] flex-col items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{h.label}</span>
                    <div
                      className={
                        h.active
                          ? "h-28 w-8 rounded-full bg-gradient-to-t from-[#2962FF] to-[#94aaff] shadow-[0_0_24px_rgba(41,98,255,0.5)]"
                          : "h-28 w-8 rounded-full bg-[#1e293b]"
                      }
                    />
                    <span className="text-sm font-bold text-slate-300">{h.temp}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly */}
            <section>
              <div className="mb-6">
                <h3 className="text-xl font-bold tracking-tight text-white">Weekly forecast</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  7-day trend analysis
                </p>
              </div>
              <ul className="space-y-3">
                {WEEKLY.map((row) => {
                  const minT = 5;
                  const maxT = 20;
                  const left = ((row.low - minT) / (maxT - minT)) * 100;
                  const width = ((row.high - row.low) / (maxT - minT)) * 100;
                  return (
                    <li
                      key={row.day}
                      className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#151a21]/50 p-6 lg:flex-row lg:items-center lg:gap-6"
                    >
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
                        <div>
                          <p className="font-bold text-white">{row.day}</p>
                          <p className="text-xs text-slate-500">{row.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <WeatherGlyph type={row.icon} />
                          <span className="text-sm text-slate-400">{row.condition}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 lg:flex-1">
                        <span className="w-8 text-sm font-bold text-slate-400">{row.low}°</span>
                        <div className="relative h-3 min-w-[140px] flex-1 rounded-full bg-[#0a0e14]">
                          <div
                            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] opacity-90"
                            style={{ left: `${left}%`, width: `${Math.max(8, width)}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm font-bold text-white">{row.high}°</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <svg className="h-3 w-3 text-sky-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path d="M12 2c-5 8-8 10-8 14a8 8 0 1016 0c0-4-3-6-8-14z" />
                          </svg>
                          {row.precip}% precip
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>

        {/* Pane 3 — metrics + AI */}
        <aside className="hidden w-80 shrink-0 flex-col gap-8 border-l border-white/5 bg-[#0a0e14] p-8 xl:flex">
          <section className="rounded-2xl border border-white/5 bg-[#151a21]/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold tracking-tight text-white">Air quality</h3>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Health status</p>
            <div className="relative mx-auto mt-8 flex h-52 w-52 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full p-[6px] shadow-[0_0_40px_rgba(34,211,238,0.25)]"
                style={{
                  background:
                    "conic-gradient(from 0deg, #22d3ee 0deg 151deg, rgba(30,41,59,0.9) 151deg 360deg)",
                }}
              />
              <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-[#0f172a]">
                <span className="text-6xl font-bold tracking-tight text-white">42</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Good</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-[#0a0e14] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PM2.5</p>
                <p className="mt-1 text-lg font-bold text-white">12</p>
                <p className="text-[10px] text-slate-500">µg/m³</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0a0e14] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NO2</p>
                <p className="mt-1 text-lg font-bold text-white">18</p>
                <p className="text-[10px] text-slate-500">ppb</p>
              </div>
            </div>
          </section>

          <WeatherAIWidget />
        </aside>
      </div>

      {/* Mobile: stack AI below — show air + AI in scroll on small screens */}
      <div className="border-t border-white/5 bg-[#0a0e14] p-8 xl:hidden">
        <section className="mx-auto max-w-md rounded-2xl border border-white/5 bg-[#151a21]/50 p-6">
          <h3 className="text-lg font-bold tracking-tight text-white">Air quality</h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Health status</p>
          <div className="relative mx-auto mt-6 flex h-44 w-44 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full p-1"
              style={{
                background: "conic-gradient(from 0deg, #22d3ee 0deg 151deg, rgba(30,41,59,0.9) 151deg 360deg)",
              }}
            />
            <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-[#0f172a]">
              <span className="text-5xl font-bold text-white">42</span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Good</span>
            </div>
          </div>
        </section>
        <div className="mx-auto mt-6 max-w-md">
          <WeatherAIWidget />
        </div>
      </div>

      <Link
        to="/"
        onClick={() => clearDevBypass()}
        className="fixed bottom-8 left-8 z-30 text-xs font-semibold text-slate-500 underline-offset-4 hover:text-app-primary hover:underline xl:left-[calc(16rem+2rem)]"
      >
        Sign out (preview)
      </Link>
    </div>
  );
}
