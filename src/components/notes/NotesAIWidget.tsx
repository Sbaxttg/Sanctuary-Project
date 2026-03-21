import { useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function SparkIcon() {
  return (
    <svg className="h-4 w-4 text-sky-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.09 6.26L20 9l-6.91.74L12 16l-1.09-6.26L4 9l6.91-.74L12 2z" />
    </svg>
  );
}

const SUGGESTED_TAGS = ["#product-design", "#scalability", "#roadmap", "#research"];

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onAppendTag: (tag: string) => void;
  hasActiveNote: boolean;
};

export function NotesAIWidget({ messages, onSend, onAppendTag, hasActiveNote }: Props) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");

  const send = () => {
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
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#151a21]/80 text-[#2962FF] shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        aria-label="Open AI Sanctuary"
      >
        <SparkIcon />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-8 right-8 z-40 flex max-h-[min(480px,calc(100vh-5rem))] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151a21]/80 shadow-[0px_32px_64px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      aria-label="AI Sanctuary"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <SparkIcon />
          <span className="text-sm font-bold tracking-tight text-[#f1f3fc]">AI Sanctuary</span>
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

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm text-slate-300">
        {messages.length === 0 && (
          <p className="leading-relaxed text-slate-400">
            I can help summarize this note, suggest headings, or pull related work from your workspace.
            Ask anything below.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-4 rounded-xl rounded-br-sm border border-[#2962FF]/30 bg-[#2962FF]/10 px-3 py-2 text-[#f1f3fc]"
                : "mr-4 rounded-xl rounded-bl-sm border border-white/10 bg-black/25 px-3 py-2 text-slate-200"
            }
          >
            {m.text}
          </div>
        ))}

        <div className="pt-2">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Suggested tags
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                disabled={!hasActiveNote}
                onClick={() => onAppendTag(tag.startsWith("#") ? tag : `#${tag}`)}
                className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium text-slate-300 transition hover:border-[#2962FF]/40 hover:text-[#f1f3fc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-sm">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#f1f3fc] placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={send}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2962FF] text-white shadow-[0_0_20px_rgba(41,98,255,0.35)] transition hover:brightness-110"
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
