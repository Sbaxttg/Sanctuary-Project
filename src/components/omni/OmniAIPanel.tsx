import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAISanctuary } from "../../context/AISanctuaryContext";
import { SimpleMarkdown } from "./SimpleMarkdown";

function SparkleIcon() {
  return (
    <svg className="h-4 w-4 text-[#2962FF]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

export function OmniAIPanel() {
  const { pathname } = useLocation();
  const { messages, thinking, error, toast, sendUserMessage, clearThread } = useAISanctuary();
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");

  if (pathname === "/") {
    return null;
  }

  const submit = () => {
    const t = draft.trim();
    if (!t || thinking) return;
    void sendUserMessage(t);
    setDraft("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#151a21]/80 text-[#2962FF] shadow-[0_0_28px_rgba(41,98,255,0.35)] backdrop-blur-xl transition hover:border-[#2962FF]/40 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
        aria-label="Open Nocturnal AI"
      >
        <SparkleIcon />
      </button>
    );
  }

  return (
    <>
      <aside
        className="fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-1rem))] max-h-[min(520px,calc(100dvh-5.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151a21]/80 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:bottom-8 sm:right-8 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-h-[min(560px,calc(100vh-5rem))]"
        aria-label="Nocturnal AI assistant"
      >
        <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <SparkleIcon />
              <span className="text-sm font-bold tracking-tight text-[#f1f3fc]">Nocturnal AI</span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94aaff]">
              {thinking ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2962FF]/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2962FF]" />
                  </span>
                  Thinking…
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  Ready
                </>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => clearThread()}
              className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-white/10 hover:text-slate-300"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Minimize assistant"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-[11px] text-red-200/90">{error}</div>
        )}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-black/25 px-3 py-2.5 text-xs text-slate-400">
              Ask anything — or try page-specific actions (e.g. schedule a meeting, search notes, draft an email).
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-2 rounded-xl rounded-br-sm border border-[#2962FF]/30 bg-[#2962FF]/10 px-3 py-2"
                  : "mr-2 rounded-xl rounded-bl-sm border border-white/10 bg-black/30 px-3 py-2"
              }
            >
              {m.role === "assistant" ? (
                <SimpleMarkdown text={m.content} />
              ) : (
                <p className="text-[13px] text-[#f1f3fc]">{m.content}</p>
              )}
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={thinking ? "Wait…" : "Ask Nocturnal AI…"}
              disabled={thinking}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={submit}
              disabled={thinking || !draft.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2962FF] text-white shadow-[0_0_20px_rgba(41,98,255,0.45)] transition hover:brightness-110 disabled:opacity-40"
              aria-label="Send"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {toast && (
        <div className="fixed bottom-[22rem] right-8 z-[110] max-w-[16rem] rounded-xl border border-[#2962FF]/30 bg-[#151a21]/95 px-4 py-2 text-xs font-semibold text-[#f1f3fc] shadow-[0_0_24px_rgba(41,98,255,0.25)] backdrop-blur-xl max-sm:bottom-40 max-sm:right-4">
          {toast}
        </div>
      )}
    </>
  );
}
