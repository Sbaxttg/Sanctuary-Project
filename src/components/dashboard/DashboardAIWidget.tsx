import { useState } from "react";

function SparkleIcon() {
  return (
    <svg className="h-4 w-4 text-app-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

export function DashboardAIWidget() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-app-primary shadow-deep backdrop-blur-2xl transition hover:border-app-primary/40"
        aria-label="Open Nocturnal AI"
      >
        <SparkleIcon />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-8 right-8 z-40 flex w-80 max-h-[min(520px,calc(100vh-6rem))] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      aria-label="Nocturnal AI assistant"
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <span className="text-sm font-bold text-white">Nocturnal AI</span>
          </div>
          <p className="mt-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-app-accent-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Listening&hellip;
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close assistant"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
        <div className="rounded-xl bg-black/30 px-4 py-3 text-slate-300">
          <p className="font-medium text-slate-200">What does resilience mean tonight?</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-slate-300">
          <p>
            Think of it as <span className="font-semibold text-white">quiet strength</span> — steady
            progress without noise.
          </p>
        </div>
        <div className="rounded-xl border-l-2 border-app-primary/60 bg-app-primary/5 px-4 py-3 font-serif text-[13px] italic leading-relaxed text-slate-200">
          &ldquo;Nature does not hurry, yet everything is accomplished.&rdquo;
          <span className="mt-2 block font-sans text-[10px] font-bold not-italic uppercase tracking-wider text-slate-500">
            — Lao Tzu
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
          <input
            type="text"
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-white shadow-[0_0_20px_rgba(41,98,255,0.45)] transition hover:brightness-110"
            aria-label="Send"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
