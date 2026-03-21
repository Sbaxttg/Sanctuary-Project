import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  to: string;
  subject: string;
  body: string;
  onToChange: (v: string) => void;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  error: string | null;
};

export function ComposeModal({
  open,
  onClose,
  to,
  subject,
  body,
  onToChange,
  onSubjectChange,
  onBodyChange,
  onSend,
  sending,
  error,
}: Props) {
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      firstRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#151a21]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="compose-title" className="text-lg font-bold tracking-tight text-[#f1f3fc]">
            Compose
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close compose"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">To</span>
            <input
              ref={firstRef}
              type="email"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              placeholder="name@example.com"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e14] px-4 py-3 text-sm font-medium text-[#f1f3fc] placeholder:text-slate-500 outline-none ring-app-primary/0 transition focus:border-[#2962FF]/50 focus:ring-2 focus:ring-[#2962FF]/30"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Subject"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e14] px-4 py-3 text-sm font-bold tracking-tight text-[#f1f3fc] placeholder:text-slate-500 outline-none ring-app-primary/0 transition focus:border-[#2962FF]/50 focus:ring-2 focus:ring-[#2962FF]/30"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Body</span>
            <textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Write your message…"
              rows={8}
              className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-[#0a0e14] px-4 py-3 text-sm font-medium leading-relaxed text-[#f1f3fc] placeholder:text-slate-500 outline-none ring-app-primary/0 transition focus:border-[#2962FF]/50 focus:ring-2 focus:ring-[#2962FF]/30"
            />
          </label>
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={onSend}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2962FF] to-[#94aaff] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(41,98,255,0.4)] transition hover:brightness-110 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
