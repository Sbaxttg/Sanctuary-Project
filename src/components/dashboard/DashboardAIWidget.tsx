import { useState } from "react";

export type DashboardChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function SparkleIcon() {
  return (
    <svg className="h-4 w-4 text-[#2962FF]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

type Props = {
  messages: DashboardChatMessage[];
  onSend: (text: string) => void;
};

export function DashboardAIWidget({ messages, onSend }: Props) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#20262f]/60 text-[#2962FF] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl transition hover:border-[#2962FF]/40"
        aria-label="Open Nocturnal AI"
      >
        <SparkleIcon />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-8 right-8 z-40 flex w-80 max-h-[min(520px,calc(100vh-6rem))] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#20262f]/60 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      aria-label="Nocturnal AI assistant"
    >
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <span className="text-sm font-bold tracking-tight text-[#f1f3fc]">AI Sanctuary</span>
          </div>
          <p className="mt-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94aaff]">
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

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
        {messages.length === 0 && (
          <div className="rounded-xl bg-black/30 px-4 py-3 text-slate-300">
            <p className="font-medium text-[#f1f3fc]/90">What does resilience mean tonight?</p>
            <p className="mt-2 text-xs text-slate-500">
              Try typing <span className="font-semibold text-[#2962FF]">random quote</span> to refresh the
              wall without reloading.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-3 rounded-xl rounded-br-sm border border-[#2962FF]/25 bg-[#2962FF]/10 px-4 py-2.5 text-[#f1f3fc]"
                : "mr-3 rounded-xl rounded-bl-sm border border-white/10 bg-black/25 px-4 py-2.5 text-slate-200"
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 backdrop-blur-sm">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#f1f3fc] placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={submit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2962FF] text-white shadow-[0_0_20px_rgba(41,98,255,0.45)] transition hover:brightness-110"
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
