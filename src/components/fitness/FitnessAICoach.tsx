import { useEffect, useRef, useState } from "react";

export type ChatMessage = { id: string; role: "coach" | "user"; text: string };

function BotIcon() {
  return (
    <svg className="h-5 w-5 text-app-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "coach",
    text: "Your recovery score is strong — when you log goals and sessions, I can tailor suggestions. Ask me anything when you're ready to connect an LLM.",
  },
];

export function FitnessAICoach() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Placeholder echo — swap for fetch() to your LLM API
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          role: "coach",
          text: "Message received — wire this widget to your API to get live coaching responses.",
        },
      ]);
    }, 400);
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-8 z-40 flex max-h-[min(70vh,520px)] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151a21]/80 shadow-[0px_32px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          role="dialog"
          aria-label="AI Coach"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">AI Coach</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
          >
            {messages.map((m) =>
              m.role === "coach" ? (
                <div key={m.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-primary/20">
                    <BotIcon />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-black/30 px-4 py-3 text-[13px] leading-relaxed text-slate-300">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-app-primary/30 bg-app-primary/15 px-4 py-3 text-[13px] leading-relaxed text-slate-100">
                    {m.text}
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 p-4">
            <div className="flex gap-2 rounded-xl border border-white/10 bg-[#0a0e14] px-3 py-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask your coach..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 outline-none"
                aria-label="Message to coach"
              />
              <button
                type="button"
                onClick={send}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-primary text-white transition hover:brightness-110"
                aria-label="Send"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-app-primary text-white shadow-[0_8px_32px_rgba(41,98,255,0.5)] transition hover:brightness-110"
        aria-label="Open AI Coach"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </>
  );
}
