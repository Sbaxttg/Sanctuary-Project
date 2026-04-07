export type AIProvider = "openai" | "gemini";

function getProvider(): AIProvider {
  const raw = import.meta.env.VITE_AI_PROVIDER as string | undefined;
  const p = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (p === "gemini" || p === "openai") return p;
  // Match `.env.example`: Gemini + `GEMINI_API_KEY` on the dev proxy is the default path.
  return "gemini";
}

function apiBase(): string {
  const b = import.meta.env.VITE_API_BASE_URL;
  return typeof b === "string" ? b.trim().replace(/\/$/, "") : "";
}

function chatCompletionUrl(provider: AIProvider): string {
  const path =
    provider === "gemini"
      ? "/api/gemini/chat/completions"
      : "/api/openai/v1/chat/completions";
  const base = apiBase();
  if (base) return `${base}${path}`;
  if (import.meta.env.DEV) return path;
  throw new Error(
    "Nocturnal AI: set VITE_API_BASE_URL in Vercel to your Render API URL (e.g. https://sanctuary-api.onrender.com).",
  );
}

export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ApiMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: {
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }[];
    }
  | { role: "tool"; tool_call_id: string; content: string };

export type ChatCompletionResponse = {
  choices?: {
    message: {
      role: string;
      content: string | null;
      tool_calls?: {
        id: string;
        type: string;
        function: { name: string; arguments: string };
      }[];
    };
    finish_reason?: string;
  }[];
  error?: { message?: string };
};

/** Default chat model for the active `VITE_AI_PROVIDER`. */
export function getChatModel(): string {
  if (getProvider() === "gemini") {
    const m = import.meta.env.VITE_GEMINI_MODEL;
    return (typeof m === "string" && m.trim() ? m.trim() : null) || "gemini-2.5-flash";
  }
  const m = import.meta.env.VITE_OPENAI_MODEL;
  return (typeof m === "string" && m.trim() ? m.trim() : null) || "gpt-4o-mini";
}

/** @deprecated Use getChatModel() */
export function getOpenAIModel(): string {
  return getChatModel();
}

export async function createChatCompletion(body: {
  model: string;
  messages: ApiMessage[];
  tools?: unknown[];
  tool_choice?: "auto" | "none";
}): Promise<ChatCompletionResponse> {
  const provider = getProvider();
  const res = await fetch(chatCompletionUrl(provider), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: ChatCompletionResponse = {};
  try {
    data = text ? (JSON.parse(text) as ChatCompletionResponse) : {};
  } catch {
    throw new Error(text || `AI error (${res.status})`);
  }
  if (!res.ok) {
    const errObj = data.error as { message?: string } | undefined;
    const msg =
      errObj?.message ||
      (typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : undefined);
    const hint =
      res.status === 401 || res.status === 403
        ? ` (${provider === "gemini" ? "check GEMINI_API_KEY on Render (or .env for local dev)" : "check OPENAI_API_KEY on Render and VITE_AI_PROVIDER=openai"})`
        : "";
    throw new Error((msg || text || `AI HTTP ${res.status}`) + hint);
  }
  return data;
}
