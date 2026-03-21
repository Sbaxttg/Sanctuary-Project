/**
 * OpenWeatherMap — free tier (https://openweathermap.org/api)
 * Set VITE_OPENWEATHER_API_KEY in .env (see .env.example)
 */

const API = "https://api.openweathermap.org/data/2.5";

export function getApiKey(): string | undefined {
  const k = import.meta.env.VITE_OPENWEATHER_API_KEY;
  return typeof k === "string" && k.length > 0 ? k : undefined;
}

export class WeatherApiError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export interface CurrentWeatherData {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedMs: number;
  visibilityM: number;
  description: string;
  iconCode: string;
  dt: number;
  timezone: number;
}

export interface HourlyBar {
  label: string;
  tempC: number;
  /** Closest to "now" for highlight */
  isNow: boolean;
}

export interface DailyForecastRow {
  dayLabel: string;
  dateLabel: string;
  condition: string;
  low: number;
  high: number;
  precipChance: number;
  icon: string;
}

export interface AirQualityData {
  aqi: number; // 1–5 OWM scale
  label: string;
  pm25: number;
  no2: number;
  /** 0–100 for gauge arc */
  gaugePercent: number;
}

export interface WeatherBundle {
  current: CurrentWeatherData;
  hourly: HourlyBar[];
  daily: DailyForecastRow[];
  air: AirQualityData | null;
}

const AQI_LABELS = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

function aqiToGaugePercent(aqi: number): number {
  const clamped = Math.min(5, Math.max(1, aqi));
  return ((clamped - 1) / 4) * 100;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string; cod?: string };
    throw new WeatherApiError(err.message || `HTTP ${res.status}`, String(err.cod ?? res.status));
  }
  return res.json() as Promise<T>;
}

type OWCurrent = {
  coord: { lat: number; lon: number };
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: { speed: number };
  visibility?: number;
  weather: { description: string; icon: string }[];
  dt: number;
  timezone: number;
};

type OWForecast = {
  list: {
    dt: number;
    main: { temp_min: number; temp_max: number; temp: number };
    weather: { description: string; icon: string }[];
    pop: number;
  }[];
};

type OWAir = {
  list: { main: { aqi: number }; components: { pm2_5: number; no2: number } }[];
};

function parseCurrent(data: OWCurrent): CurrentWeatherData {
  const w = data.weather[0];
  return {
    cityName: data.name,
    country: data.sys.country,
    lat: data.coord.lat,
    lon: data.coord.lon,
    tempC: data.main.temp,
    feelsLikeC: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeedMs: data.wind?.speed ?? 0,
    visibilityM: data.visibility ?? 10_000,
    description: w?.description ?? "",
    iconCode: w?.icon ?? "02d",
    dt: data.dt,
    timezone: data.timezone,
  };
}

/** US ZIP 5 or 5+4 */
function looksUsZip(q: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(q.trim());
}

export async function fetchWeatherByQuery(query: string): Promise<{ lat: number; lon: number; current: OWCurrent }> {
  const key = getApiKey();
  if (!key) throw new WeatherApiError("Add VITE_OPENWEATHER_API_KEY to your .env file.");

  const q = query.trim();
  if (!q) throw new WeatherApiError("Enter a city or ZIP code.");

  let url: string;
  if (looksUsZip(q)) {
    url = `${API}/weather?zip=${encodeURIComponent(q)},us&appid=${key}&units=metric`;
  } else {
    url = `${API}/weather?q=${encodeURIComponent(q)}&appid=${key}&units=metric`;
  }

  const data = await fetchJson<OWCurrent>(url);
  return { lat: data.coord.lat, lon: data.coord.lon, current: data };
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<OWCurrent> {
  const key = getApiKey();
  if (!key) throw new WeatherApiError("Add VITE_OPENWEATHER_API_KEY to your .env file.");
  const url = `${API}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
  return fetchJson<OWCurrent>(url);
}

async function fetchForecast(lat: number, lon: number): Promise<OWForecast> {
  const key = getApiKey();
  if (!key) throw new WeatherApiError("Missing API key.");
  const url = `${API}/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
  return fetchJson<OWForecast>(url);
}

async function fetchAir(lat: number, lon: number): Promise<AirQualityData | null> {
  const key = getApiKey();
  if (!key) return null;
  try {
    const url = `${API}/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
    const data = await fetchJson<OWAir>(url);
    const row = data.list[0];
    if (!row) return null;
    const aqi = row.main.aqi;
    return {
      aqi,
      label: AQI_LABELS[aqi - 1] ?? "Unknown",
      pm25: row.components.pm2_5,
      no2: row.components.no2,
      gaugePercent: aqiToGaugePercent(aqi),
    };
  } catch {
    return null;
  }
}

/** OpenWeather: local civil time = UTC epoch + timezone offset (seconds) */
function formatHourLabel(dtSec: number, tzOffset: number): string {
  const d = new Date((dtSec + tzOffset) * 1000);
  return d.toLocaleTimeString(undefined, { hour: "numeric", hour12: true, timeZone: "UTC" });
}

function buildHourly(forecast: OWForecast, timezone: number, nowSec: number): HourlyBar[] {
  const list = forecast.list.slice(0, 8);
  let closestIdx = 0;
  let bestDelta = Infinity;
  list.forEach((item, i) => {
    const d = Math.abs(item.dt - nowSec);
    if (d < bestDelta) {
      bestDelta = d;
      closestIdx = i;
    }
  });
  return list.map((item, i) => ({
    label: formatHourLabel(item.dt, timezone),
    tempC: item.main.temp,
    isNow: i === closestIdx,
  }));
}

function iconToGlyph(icon: string): string {
  if (icon.startsWith("01")) return "sun";
  if (icon.startsWith("02")) return "partly";
  if (icon.startsWith("03") || icon.startsWith("04")) return "cloud";
  if (icon.startsWith("09") || icon.startsWith("10") || icon.startsWith("11")) return "rain";
  return "cloud";
}

function buildDaily(forecast: OWForecast, timezone: number): DailyForecastRow[] {
  const byDay = new Map<
    string,
    { min: number; max: number; pops: number[]; icon: string; desc: string; ts: number }
  >();

  for (const item of forecast.list) {
    const local = new Date((item.dt + timezone) * 1000);
    const key = `${local.getUTCFullYear()}-${local.getUTCMonth()}-${local.getUTCDate()}`;
    const tMin = item.main.temp_min;
    const tMax = item.main.temp_max;
    const w = item.weather[0];
    const existing = byDay.get(key);
    if (!existing) {
      byDay.set(key, {
        min: tMin,
        max: tMax,
        pops: [item.pop],
        icon: w?.icon ?? "02d",
        desc: w?.description ?? "",
        ts: item.dt,
      });
    } else {
      existing.min = Math.min(existing.min, tMin);
      existing.max = Math.max(existing.max, tMax);
      existing.pops.push(item.pop);
      if (item.dt < existing.ts) {
        existing.ts = item.dt;
        existing.icon = w?.icon ?? existing.icon;
        existing.desc = w?.description ?? existing.desc;
      }
    }
  }

  const sorted = [...byDay.entries()].sort((a, b) => a[1].ts - b[1].ts).slice(0, 7);

  return sorted.map(([_, v], idx) => {
    const local = new Date((v.ts + timezone) * 1000);
    const dateLabel = local.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).toUpperCase();
    const weekday = local.toLocaleDateString(undefined, { weekday: "long", timeZone: "UTC" });
    let dayLabel = weekday;
    if (idx === 0) dayLabel = "Today";
    else if (idx === 1) dayLabel = "Tomorrow";
    const avgPop = v.pops.reduce((a, b) => a + b, 0) / v.pops.length;
    return {
      dayLabel,
      dateLabel,
      condition: v.desc.replace(/\b\w/g, (c) => c.toUpperCase()),
      low: Math.round(v.min),
      high: Math.round(v.max),
      precipChance: Math.round(avgPop * 100),
      icon: iconToGlyph(v.icon),
    };
  });
}

export async function loadWeatherBundle(query: string): Promise<WeatherBundle> {
  const { lat, lon, current: raw } = await fetchWeatherByQuery(query);
  const current = parseCurrent(raw);
  const [forecast, air] = await Promise.all([fetchForecast(lat, lon), fetchAir(lat, lon)]);
  const hourly = buildHourly(forecast, current.timezone, current.dt);
  const daily = buildDaily(forecast, current.timezone);
  return { current, hourly, daily, air };
}

export async function loadWeatherBundleByCoords(lat: number, lon: number): Promise<WeatherBundle> {
  const raw = await fetchWeatherByCoords(lat, lon);
  const current = parseCurrent(raw);
  const [forecast, air] = await Promise.all([fetchForecast(current.lat, current.lon), fetchAir(current.lat, current.lon)]);
  const hourly = buildHourly(forecast, current.timezone, current.dt);
  const daily = buildDaily(forecast, current.timezone);
  return { current, hourly, daily, air };
}

export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

export function mToKm(m: number): number {
  return Math.round((m / 1000) * 10) / 10;
}

export function formatLocalDate(dtSec: number, timezone: number): string {
  const d = new Date((dtSec + timezone) * 1000);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
