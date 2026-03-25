import { useEffect, useRef, useState } from "react";

function SparkleIcon() {
  return (
    <svg className="h-5 w-5 text-sky-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

export type WeatherConciergeContext = {
  cityName: string;
  tempF: number;
  feelsLikeF: number;
  description: string;
  windMph: number;
  humidity: number;
} | null;

function buildSmartSuggestion(ctx: NonNullable<WeatherConciergeContext>): string {
  const t = ctx.tempF;
  const desc = ctx.description.toLowerCase();
  const wind = ctx.windMph;
  const hum = ctx.humidity;

  if (t < 32) {
    return `Sub-freezing: insulated jacket, gloves, and traction-aware footwear. Wind ${wind} mph — cover exposed skin.`;
  }
  if (t < 46) {
    return `Optimal attire: warm coat, light layers, and a scarf if wind picks up (${wind} mph).`;
  }
  if (t < 61) {
    return `Light jacket or breathable layers. ${hum}% humidity — comfortable for brisk walks or easy runs.`;
  }
  if (t < 79) {
    if (desc.includes("rain") || desc.includes("drizzle")) {
      return `Mild with wet conditions — bring a breathable waterproof shell and quick-dry base layer.`;
    }
    return `Optimal attire: breathable top + optional light layer. Great window for outdoor training.`;
  }
  return `Heat: light fabrics, sun protection, and steady hydration (${hum}% humidity). Prefer shade during peak sun.`;
}

function buildIntroLine(ctx: NonNullable<WeatherConciergeContext>): string {
  const place = ctx.cityName;
  const t = Math.round(ctx.tempF);
  const desc = ctx.description.replace(/\b\w/g, (c) => c.toUpperCase());
  return `${place}: ${t}°F and ${desc}. Wind ${ctx.windMph} mph — here’s a quick take on what to wear.`;
}

export function WeatherAIWidget({ weather }: { weather: WeatherConciergeContext }) {
  const [chatInput, setChatInput] = useState("");
  const [lines, setLines] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const suggestion = weather ? buildSmartSuggestion(weather) : "";
  const intro = weather ? buildIntroLine(weather) : "";
  const bestWindow =
    weather && weather.tempF >= 41 && weather.tempF < 82
      ? "Aim for mid-morning or early evening when light is softer and wind is often calmer."
      : "Adjust outdoor time to avoid peak heat or wind chill depending on your comfort zone.";

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setLines((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setTimeout(() => {
      setLines((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            weather?.cityName
              ? `Noted for ${weather.cityName}. Connect an LLM API here to answer: “${text.slice(0, 80)}${text.length > 80 ? "…" : ""}”`
              : "Search for a location first — then wire this to your concierge API.",
        },
      ]);
    }, 350);
  }

  return (
    <div
      className="flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#151a21]/80 shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      aria-label="AI Sanctuary weather concierge"
    >
      <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <div>
            <p className="text-sm font-bold text-white">AI Sanctuary</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Weather concierge
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-300">
        {!weather ? (
          <p className="text-slate-500">Load weather by searching a city or using your location.</p>
        ) : (
          <>
            <p>{intro}</p>
            <div className="rounded-2xl border border-app-primary/40 bg-app-primary/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/90">Smart suggestion</p>
              <p className="mt-2 text-[13px] font-semibold text-sky-100">{suggestion}</p>
              <p className="mt-3 text-xs text-slate-400">{bestWindow}</p>
            </div>
            {lines.map((line, i) =>
              line.role === "user" ? (
                <p key={i} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-[13px] text-slate-200">
                  {line.text}
                </p>
              ) : (
                <p key={i} className="text-[13px] text-slate-400">
                  {line.text}
                </p>
              ),
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendChat();
              }
            }}
            placeholder="Ask about activities or gear..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={sendChat}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-primary text-white shadow-[0_0_20px_rgba(41,98,255,0.45)] transition hover:brightness-110"
            aria-label="Send"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
