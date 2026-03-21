import { useState } from "react";

function SparkIcon() {
  return (
    <svg className="h-4 w-4 text-sky-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

export function NotesAIWidget() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#20262f]/80 text-app-primary shadow-[0px_24px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        aria-label="Open AI Sanctuary"
      >
        <SparkIcon />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-8 right-8 z-40 flex w-80 max-h-[min(480px,calc(100vh-5rem))] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#20262f]/60 shadow-[0px_24px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl"
      aria-label="AI Sanctuary"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <SparkIcon />
          <span className="text-sm font-bold text-white">AI Sanctuary</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm text-slate-300">
        <p className="leading-relaxed">
          I can help summarize this note, suggest headings, or pull related work from your
          workspace.
        </p>
        <button
          type="button"
          className="w-full rounded-xl border border-slate-500/40 bg-slate-800/50 px-4 py-2.5 text-left text-[13px] font-semibold text-slate-200 transition hover:border-app-primary/40 hover:bg-slate-800"
        >
          Show me related tags
        </button>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium text-slate-400">
            #product-design
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium text-slate-400">
            #scalability
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
          <input
            type="text"
            placeholder="Ask anything..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-white shadow-[0_0_20px_rgba(41,98,255,0.35)]"
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
