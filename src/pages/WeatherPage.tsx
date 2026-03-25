import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { clearDevBypass } from "../lib/auth";
import { SideNavBar } from "../components/dashboard/SideNavBar";
import { WeatherAIWidget } from "../components/weather/WeatherAIWidget";
import {
  WeatherApiError,
  formatLocalDate,
  getApiKey,
  loadWeatherBundle,
  loadWeatherBundleByCoords,
  mToMiles,
  type AirQualityData,
  type WeatherBundle,
} from "../lib/weatherApi";

const STORAGE_LAST_CITY = "sanctuary-weather-last-city";

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

function AirQualityPanel({ air, compact }: { air: AirQualityData | null; compact?: boolean }) {
  const sweep = air ? Math.round(40 + (air.gaugePercent / 100) * 280) : 0;
  const labelColor =
    air == null
      ? "text-slate-500"
      : air.aqi <= 2
        ? "text-emerald-400"
        : air.aqi === 3
          ? "text-amber-400"
          : "text-red-400";

  return (
    <section
      className={`rounded-2xl border border-white/5 bg-[#151a21]/50 backdrop-blur-sm ${compact ? "p-6" : "p-6"}`}
    >
      <h3 className="text-lg font-bold tracking-tight text-white">Air quality</h3>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Health status</p>
      <div className={`relative mx-auto mt-8 flex items-center justify-center ${compact ? "h-44 w-44" : "h-52 w-52"}`}>
        <div
          className="absolute inset-0 rounded-full p-[6px] shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          style={{
            background: air
              ? `conic-gradient(from 0deg, #22d3ee 0deg ${sweep}deg, rgba(30,41,59,0.9) ${sweep}deg 360deg)`
              : "conic-gradient(from 0deg, rgba(51,65,85,0.8) 0deg 360deg)",
          }}
        />
        <div className={`absolute flex flex-col items-center justify-center rounded-full bg-[#0f172a] ${compact ? "inset-2" : "inset-[10px]"}`}>
          <span className={`${compact ? "text-5xl" : "text-6xl"} font-bold tracking-tight text-white`}>
            {air ? Math.round(air.pm25 * 2 + air.aqi * 8) : "—"}
          </span>
          <span className={`mt-1 text-xs font-bold uppercase tracking-[0.2em] ${labelColor}`}>
            {air?.label ?? "—"}
          </span>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-[#0a0e14] p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PM2.5</p>
          <p className="mt-1 text-lg font-bold text-white">{air ? air.pm25.toFixed(1) : "—"}</p>
          <p className="text-[10px] text-slate-500">µg/m³</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0e14] p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NO2</p>
          <p className="mt-1 text-lg font-bold text-white">{air ? air.no2.toFixed(1) : "—"}</p>
          <p className="text-[10px] text-slate-500">µg/m³</p>
        </div>
      </div>
    </section>
  );
}

function initialSearchQuery(): string {
  try {
    return localStorage.getItem(STORAGE_LAST_CITY) || "London";
  } catch {
    return "London";
  }
}

export function WeatherPage() {
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(() => initialSearchQuery());
  const [geoLoading, setGeoLoading] = useState(false);

  const hasKey = Boolean(getApiKey());

  const runLoad = useCallback(async (fn: () => Promise<WeatherBundle>) => {
    setLoading(true);
    setError(null);
    try {
      const b = await fn();
      setBundle(b);
      try {
        localStorage.setItem(STORAGE_LAST_CITY, `${b.current.cityName}, ${b.current.country}`);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setBundle(null);
      setError(e instanceof WeatherApiError ? e.message : "Could not load weather.");
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "The Sanctuary — Forecast";
  }, []);

  useEffect(() => {
    const q = searchDraft.trim() || "London";
    if (hasKey) {
      void runLoad(() => loadWeatherBundle(q));
    } else {
      setBundle(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load when key appears; city from draft
  }, [hasKey]);

  const onSearch = () => {
    const q = searchDraft.trim();
    if (!q || !hasKey) return;
    void runLoad(() => loadWeatherBundle(q));
  };

  const onUseLocation = () => {
    if (!hasKey) return;
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void runLoad(() => loadWeatherBundleByCoords(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => {
        setGeoLoading(false);
        setError(err.message || "Could not read your location.");
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const conciergeContext = useMemo(() => {
    if (!bundle) return null;
    return {
      cityName: `${bundle.current.cityName}, ${bundle.current.country}`,
      tempF: bundle.current.tempF,
      feelsLikeF: bundle.current.feelsLikeF,
      description: bundle.current.description,
      windMph: Math.round(bundle.current.windSpeedMph),
      humidity: bundle.current.humidity,
    };
  }, [bundle]);

  const hourlyBars = useMemo(() => {
    if (!bundle?.hourly.length) return [];
    const temps = bundle.hourly.map((h) => h.tempF);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const span = Math.max(1, maxT - minT);
    return bundle.hourly.map((h) => ({
      ...h,
      heightPct: 25 + ((h.tempF - minT) / span) * 65,
    }));
  }, [bundle]);

  const weeklyRange = useMemo(() => {
    if (!bundle?.daily.length) return { min: 32, max: 90 };
    const lows = bundle.daily.map((d) => d.low);
    const highs = bundle.daily.map((d) => d.high);
    return {
      min: Math.min(...lows) - 2,
      max: Math.max(...highs) + 2,
    };
  }, [bundle]);

  return (
    <div className="min-h-screen bg-[#0a0e14] font-sans text-slate-100 antialiased">
      <SideNavBar />

      <div className="flex min-h-screen pl-64">
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#0a0e14]/90 px-4 py-3 backdrop-blur-xl md:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sanctuary Forecast</h1>
            <div className="flex w-full flex-1 flex-wrap items-center justify-end gap-2 md:gap-4 lg:max-w-2xl">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0c1016] px-3 py-2 md:px-4">
                <button
                  type="button"
                  onClick={onSearch}
                  disabled={loading || !hasKey}
                  className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-40"
                  aria-label="Search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSearch();
                    }
                  }}
                  placeholder="City or ZIP (US)…"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                onClick={onUseLocation}
                disabled={geoLoading || loading || !hasKey}
                className="shrink-0 rounded-full border border-app-primary/40 bg-app-primary/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-app-primary transition hover:bg-app-primary/25 disabled:opacity-40"
              >
                {geoLoading ? "Locating…" : "Use my location"}
              </button>
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

          {!hasKey && (
            <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90 md:px-8">
              <p className="font-semibold text-amber-50">OpenWeather API key needed for live data</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-100/85">
                Sanctuary Forecast uses{" "}
                <a
                  href="https://openweathermap.org/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-200 underline-offset-2 hover:underline"
                >
                  OpenWeatherMap
                </a>{" "}
                (free tier). Create an account → <strong>API keys</strong> → copy your key.
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-amber-100/80">
                <li>
                  Open{" "}
                  <code className="rounded bg-black/30 px-1">.env</code> in the project root (next to{" "}
                  <code className="rounded bg-black/30 px-1">package.json</code>).
                </li>
                <li>
                  Set:{" "}
                  <code className="rounded bg-black/30 px-1">VITE_OPENWEATHER_API_KEY=your_key_here</code>
                </li>
                <li>
                  Save, then restart <code className="rounded bg-black/30 px-1">npm run dev</code> (Vite only
                  reads <code className="rounded bg-black/30 px-1">.env</code> on startup).
                </li>
              </ol>
              <p className="mt-3 text-[11px] text-amber-200/70">
                New keys can take up to ~2 hours to activate. Then search any city, US ZIP, or use{" "}
                <strong>Use my location</strong>.
              </p>
            </div>
          )}
          {error && (
            <div className="border-b border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100/90 md:px-8">
              {error}
            </div>
          )}
          {loading && (
            <div className="border-b border-white/5 px-8 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loading forecast…
            </div>
          )}

          <div className="space-y-8 p-8 pb-24">
            <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 shadow-deep md:p-10">
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Live conditions
              </div>
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
                    {bundle ? `${bundle.current.cityName}, ${bundle.current.country}` : "—"}
                  </h2>
                  <p className="mt-3 text-xl font-semibold text-slate-400">
                    {bundle ? formatLocalDate(bundle.current.dt, bundle.current.timezone) : "Search a city to begin"}
                  </p>
                  <p className="mt-2 text-9xl font-bold leading-none tracking-tighter text-white md:text-[10rem]">
                    {bundle ? `${Math.round(bundle.current.tempF)}°F` : "—"}
                  </p>
                </div>
                <div className="flex flex-col items-center lg:items-end">
                  {bundle ? (
                    <img
                      src={`https://openweathermap.org/img/wn/${bundle.current.iconCode}@4x.png`}
                      alt=""
                      className="h-32 w-32 object-contain md:h-40 md:w-40"
                    />
                  ) : (
                    <BigCloud />
                  )}
                  <p className="mt-4 text-center text-lg font-semibold capitalize text-slate-300 lg:text-right">
                    {bundle?.current.description ?? "—"}
                  </p>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-sky-400">◇</span> Wind
                  </p>
                  <p className="mt-2 text-lg font-bold text-sky-100">
                    {bundle ? `${Math.round(bundle.current.windSpeedMph)} mph` : "—"}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-cyan-400">◆</span> Humidity
                  </p>
                  <p className="mt-2 text-lg font-bold text-cyan-100">{bundle ? `${bundle.current.humidity}%` : "—"}</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-indigo-400">◎</span> Visibility
                  </p>
                  <p className="mt-2 text-lg font-bold text-indigo-100">
                    {bundle ? `${mToMiles(bundle.current.visibilityM)} mi` : "—"}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold tracking-tight text-white">Hourly temperature</h3>
              <p className="mt-1 text-xs text-slate-500">Next ~24h from forecast (3-hour steps)</p>
              <div className="mt-6 flex items-end justify-between gap-2 overflow-x-auto pb-2">
                {hourlyBars.length === 0 ? (
                  <p className="text-sm text-slate-500">Load weather to see hourly bars.</p>
                ) : (
                  hourlyBars.map((h) => (
                    <div key={h.label} className="flex min-w-[52px] flex-col items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{h.label}</span>
                      <div
                        className={
                          h.isNow
                            ? "w-8 rounded-full bg-gradient-to-t from-[#2962FF] to-[#94aaff] shadow-[0_0_24px_rgba(41,98,255,0.5)]"
                            : "w-8 rounded-full bg-[#1e293b]"
                        }
                        style={{ height: `${Math.max(28, (h.heightPct / 100) * 112)}px` }}
                      />
                      <span className="text-sm font-bold text-slate-300">{Math.round(h.tempF)}°F</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="mb-6">
                <h3 className="text-xl font-bold tracking-tight text-white">Weekly forecast</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  7-day trend (from 5-day / 3-hour API)
                </p>
              </div>
              <ul className="space-y-3">
                {bundle?.daily.length ? (
                  bundle.daily.map((row) => {
                    const { min, max } = weeklyRange;
                    const span = Math.max(1, max - min);
                    const left = ((row.low - min) / span) * 100;
                    const width = ((row.high - row.low) / span) * 100;
                    return (
                      <li
                        key={`${row.dayLabel}-${row.dateLabel}`}
                        className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#151a21]/50 p-6 lg:flex-row lg:items-center lg:gap-6"
                      >
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
                          <div>
                            <p className="font-bold text-white">{row.dayLabel}</p>
                            <p className="text-xs text-slate-500">{row.dateLabel}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <WeatherGlyph type={row.icon} />
                            <span className="text-sm text-slate-400">{row.condition}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 lg:flex-1">
                          <span className="w-8 text-sm font-bold text-slate-400">{row.low}°F</span>
                          <div className="relative h-3 min-w-[140px] flex-1 rounded-full bg-[#0a0e14]">
                            <div
                              className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] opacity-90"
                              style={{ left: `${left}%`, width: `${Math.max(8, width)}%` }}
                            />
                          </div>
                          <span className="w-8 text-sm font-bold text-white">{row.high}°F</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <svg className="h-3 w-3 text-sky-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path d="M12 2c-5 8-8 10-8 14a8 8 0 1016 0c0-4-3-6-8-14z" />
                            </svg>
                            {row.precipChance}% precip
                          </span>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
                    No multi-day data yet — check API key and search.
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 flex-col gap-8 border-l border-white/5 bg-[#0a0e14] p-8 xl:flex">
          <AirQualityPanel air={bundle?.air ?? null} />
          <WeatherAIWidget weather={conciergeContext} />
        </aside>
      </div>

      <div className="border-t border-white/5 bg-[#0a0e14] p-8 xl:hidden">
        <AirQualityPanel air={bundle?.air ?? null} compact />
        <div className="mx-auto mt-6 max-w-md">
          <WeatherAIWidget weather={conciergeContext} />
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
