import { useState } from "react";

function SparkleIcon() {
  return (
    <svg className="h-5 w-5 text-sky-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

export function EmailAIWidget() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#151a21]/90 text-app-primary shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        aria-label="Open AI Sanctuary"
      >
        <SparkleIcon />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-8 right-8 z-40 flex w-80 max-h-[min(520px,calc(100vh-5rem))] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151a21]/90 shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      aria-label="AI Sanctuary insight"
    >
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <div>
              <p className="text-sm font-bold text-white">AI Sanctuary</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                Active insight
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-300">
        <p>
          I noticed you have a high volume of unread mail from &apos;Project Sanctuary&apos;.
          Would you like me to summarize the key action items for you?
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] px-4 py-2 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.4)] transition hover:brightness-110"
          >
            Summarize
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[13px] font-semibold text-slate-400 transition hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
          <input
            type="text"
            placeholder="Ask anything..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Voice input"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
