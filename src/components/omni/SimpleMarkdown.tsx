import { Fragment } from "react";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal markdown: fenced ``` blocks, **bold**, `code`, bullets, newlines. */
export function SimpleMarkdown({ text }: { text: string }) {
  const segments = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-[13px] leading-relaxed text-slate-200">
      {segments.map((seg, i) => {
        if (seg.startsWith("```")) {
          const inner = seg.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] text-sky-100/90"
            >
              {inner.trimEnd()}
            </pre>
          );
        }

        const lines = seg.split("\n");
        return (
          <Fragment key={i}>
            {lines.map((line, li) => {
              const bullet = /^[-*]\s+(.+)/.exec(line);
              if (bullet) {
                return (
                  <p key={li} className="ml-3 list-item text-slate-300">
                    • {renderInline(bullet[1])}
                  </p>
                );
              }
              if (line.trim() === "") return <br key={li} />;
              return (
                <p key={li} className="text-slate-200">
                  {renderInline(line)}
                </p>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}

function renderInline(line: string) {
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[#f1f3fc]">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-sky-200">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={i} dangerouslySetInnerHTML={{ __html: escapeHtml(p).replace(/\n/g, "<br/>") }} />;
  });
}
