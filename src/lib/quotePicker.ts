import type { MotivationalQuote } from "../data/motivationalQuotes";

/** Dedupe by quote text, then shuffle and take first `count` entries. */
export function pickUniqueRandomQuotes(quotes: MotivationalQuote[], count: number): MotivationalQuote[] {
  const seen = new Set<string>();
  const unique: MotivationalQuote[] = [];
  for (const q of quotes) {
    const key = q.text.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(q);
  }
  const copy = [...unique];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}
