function SparkleIcon() {
  return (
    <svg className="h-5 w-5 text-sky-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

/** Glass concierge card for the Weather page right column */
export function WeatherAIWidget() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#151a21]/80 shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      aria-label="AI Sanctuary weather concierge"
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
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

      <div className="space-y-4 px-5 py-4 text-sm leading-relaxed text-slate-300">
        <p>
          Good morning, Alex — it&apos;s mild with a light breeze. Perfect for a brisk walk or an
          easy tempo run before noon.
        </p>
        <div className="rounded-2xl border border-app-primary/40 bg-app-primary/5 p-4">
          <p className="text-[13px] font-semibold text-sky-100">
            Light layers + breathable shell. Best run window:{" "}
            <span className="text-white">9:00 – 10:30 AM</span> when humidity dips.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5">
          <input
            type="text"
            placeholder="Ask about activities or gear..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-primary text-white shadow-[0_0_20px_rgba(41,98,255,0.45)]"
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
