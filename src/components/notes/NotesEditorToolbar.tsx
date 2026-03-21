import type { ReactNode, RefObject } from "react";

type Props = {
  editorRef: RefObject<HTMLDivElement | null>;
};

function Btn({
  children,
  label,
  onMouseDown,
}: {
  children: ReactNode;
  label: string;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={onMouseDown}
      className="rounded-md p-2 text-slate-300 transition hover:bg-white/10 hover:text-[#f1f3fc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2962FF]/50"
    >
      {children}
    </button>
  );
}

export function NotesEditorToolbar({ editorRef }: Props) {
  const run = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    fn();
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#151a21]/80 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <Btn
        label="Bold"
        onMouseDown={run(() => {
          document.execCommand("bold", false);
        })}
      >
        <span className="text-sm font-bold">B</span>
      </Btn>
      <Btn
        label="Italic"
        onMouseDown={run(() => {
          document.execCommand("italic", false);
        })}
      >
        <span className="text-sm italic">I</span>
      </Btn>
      <Btn
        label="Bullet list"
        onMouseDown={run(() => {
          document.execCommand("insertUnorderedList", false);
        })}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </Btn>
      <Btn
        label="Numbered list"
        onMouseDown={run(() => {
          document.execCommand("insertOrderedList", false);
        })}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 20l4-16m2 16l4-16m6 4h.01M17 16h.01"
          />
        </svg>
      </Btn>
      <Btn
        label="Insert link"
        onMouseDown={run(() => {
          const url = window.prompt("Link URL:", "https://");
          if (url) document.execCommand("createLink", false, url);
        })}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </Btn>
      <Btn
        label="Insert image"
        onMouseDown={run(() => {
          const url = window.prompt("Image URL:", "https://");
          if (url) document.execCommand("insertImage", false, url);
        })}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
          />
        </svg>
      </Btn>
    </div>
  );
}
