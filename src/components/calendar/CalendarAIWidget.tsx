import { useEffect, useRef, useState } from "react";

function SparkleIcon() {
  return (
    <svg className="h-5 w-5 text-app-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

export function CalendarAIWidget() {
  const [open, setOpen] = useState(true);
  const [syncTipVisible, setSyncTipVisible] = useState(true);
  const [syncAccepted, setSyncAccepted] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setChatInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Connect an LLM API here to reschedule. Your message was logged locally.",
        },
      ]);
    }, 400);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#151a21]/80 text-app-primary shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        aria-label="Open AI Sanctuary"
      >
        <SparkleIcon />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-8 right-8 z-40 flex max-h-[min(520px,calc(100vh-5rem))] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#151a21]/80 shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      aria-label="AI Sanctuary calendar"
    >
      <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <div>
            <p className="text-sm font-bold text-app-primary">AI Sanctuary</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Intelligent sync
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

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-300">
        {syncAccepted && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] text-emerald-200">
            Sync accepted — deep-work block reserved (demo).
          </p>
        )}
        {syncTipVisible && !syncAccepted && (
          <>
            <p className="rounded-xl bg-black/25 px-4 py-3 text-[13px]">
              <span className="font-semibold text-sky-300/90">Proactive tip:</span> You have deep-work
              blocks free between <span className="font-bold text-white">2:00 PM – 4:00 PM</span> today.
              Want me to protect that window on your calendar?
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSyncAccepted(true);
                  setSyncTipVisible(false);
                }}
                className="rounded-full bg-[#2962FF] px-4 py-2 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(41,98,255,0.45)] transition hover:brightness-110"
              >
                Accept sync
              </button>
              <button
                type="button"
                onClick={() => setSyncTipVisible(false)}
                className="rounded-full px-4 py-2 text-[13px] font-semibold text-slate-400 transition hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </>
        )}
        {messages.map((msg, i) => (
          <p
            key={i}
            className={
              msg.role === "user"
                ? "rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-[13px] text-slate-100"
                : "rounded-xl bg-black/20 px-4 py-3 text-[13px] text-slate-400"
            }
          >
            {msg.text}
          </p>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
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
            placeholder="Ask AI to reschedule..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={sendChat}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-white shadow-[0_0_16px_rgba(41,98,255,0.4)]"
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
