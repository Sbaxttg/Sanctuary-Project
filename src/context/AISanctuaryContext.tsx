import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { createChatCompletion, getChatModel, type ApiMessage } from "../lib/ai/openaiClient";
import { OPENAI_TOOLS, type ToolName } from "../lib/ai/toolDefinitions";

export type AiChatLine = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AISanctuaryRegistration = {
  route: string;
  label: string;
  /** Rich context injected into the system prompt (current note, weather, etc.) */
  contextText: string;
  /** Tool name -> executor. Return a short string result for the model. */
  toolHandlers: Partial<Record<ToolName, (args: Record<string, unknown>) => string>>;
};

type Ctx = {
  messages: AiChatLine[];
  thinking: boolean;
  error: string | null;
  toast: string | null;
  sendUserMessage: (text: string) => Promise<void>;
  clearThread: () => void;
  register: (reg: AISanctuaryRegistration) => void;
  unregister: (route: string) => void;
};

const AISanctuaryContext = createContext<Ctx | null>(null);

function toolsForHandlers(handlers: AISanctuaryRegistration["toolHandlers"]) {
  const names = new Set(Object.keys(handlers) as ToolName[]);
  return OPENAI_TOOLS.filter((t) => names.has(t.function.name as ToolName));
}

function buildBaseSystemPrompt(pathname: string, reg: AISanctuaryRegistration | null): string {
  const label = reg?.label ?? "The Sanctuary";
  const ctx = reg?.contextText?.trim() || "(No extra page context.)";
  return [
    `You are **Nocturnal AI**, the premium assistant for **The Sanctuary** digital workspace (Midnight Velocity aesthetic: precise, calm, capable).`,
    `The user is on: **${label}** (path: ${pathname}).`,
    `Page context:\n${ctx}`,
    `Use markdown in replies when helpful (headings, bullets, bold, fenced code blocks).`,
    `When the user asks to perform an action this app supports, call the appropriate function tool. After tools run, give a brief confirmation in natural language.`,
    `If no tool applies, answer helpfully from context and general knowledge.`,
    `Today's reference date (user browser): ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
  ].join("\n\n");
}

export function AISanctuaryProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  const regRef = useRef<AISanctuaryRegistration | null>(null);
  const messagesRef = useRef<AiChatLine[]>([]);
  const [messages, setMessages] = useState<AiChatLine[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  messagesRef.current = messages;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const register = useCallback((reg: AISanctuaryRegistration) => {
    regRef.current = reg;
  }, []);

  const unregister = useCallback((route: string) => {
    if (regRef.current?.route === route) regRef.current = null;
  }, []);

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setError(null);

      const userLine: AiChatLine = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      setMessages((m) => [...m, userLine]);
      setThinking(true);

      const reg = regRef.current;
      const systemContent = buildBaseSystemPrompt(pathname, reg);
      const prior: ApiMessage[] = messagesRef.current.flatMap((x) => [
        { role: x.role, content: x.content } as ApiMessage,
      ]);
      const apiMessages: ApiMessage[] = [
        { role: "system", content: systemContent },
        ...prior,
        { role: "user", content: trimmed },
      ];

      const tools = reg?.toolHandlers ? toolsForHandlers(reg.toolHandlers) : [];
      const model = getChatModel();

      try {
        let loopMessages = [...apiMessages];
        const maxLoops = 6;

        for (let i = 0; i < maxLoops; i++) {
          const data = await createChatCompletion({
            model,
            messages: loopMessages,
            tools: tools.length > 0 ? tools : undefined,
            tool_choice: tools.length > 0 ? "auto" : "none",
          });

          const choice = data.choices?.[0];
          const msg = choice?.message;
          if (!msg) {
            throw new Error("Empty response from model.");
          }

          if (choice?.finish_reason === "tool_calls" && msg.tool_calls?.length) {
            loopMessages.push({
              role: "assistant",
              content: msg.content,
              tool_calls: msg.tool_calls,
            });

            for (const tc of msg.tool_calls) {
              const name = tc.function.name as ToolName;
              let args: Record<string, unknown> = {};
              try {
                args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
              } catch {
                args = {};
              }
              const handler = reg?.toolHandlers[name];
              let result = "";
              if (handler) {
                try {
                  result = handler(args);
                  showToast(`Done: ${name.replace(/_/g, " ")}`);
                } catch (e) {
                  result = e instanceof Error ? e.message : "Tool failed.";
                }
              } else {
                result = `Tool ${name} is not available on this page.`;
              }
              loopMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: result.slice(0, 8000),
              });
            }
            continue;
          }

          const content = msg.content?.trim() || "_(No text response)_";
          setMessages((m) => [
            ...m,
            { id: crypto.randomUUID(), role: "assistant", content: content },
          ]);
          break;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Request failed.";
        setError(msg);
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `**Something went wrong.** ${msg}\n\nFor **Gemini**: set \`VITE_AI_PROVIDER=gemini\`, \`GEMINI_API_KEY\` in \`.env\`, and run \`npm run dev\`. For **OpenAI**: \`VITE_AI_PROVIDER=openai\` and \`OPENAI_API_KEY\`. The dev server proxies the API so keys stay off the client.`,
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [pathname, showToast],
  );

  const clearThread = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      thinking,
      error,
      toast,
      sendUserMessage,
      clearThread,
      register,
      unregister,
    }),
    [messages, thinking, error, toast, sendUserMessage, clearThread, register, unregister],
  );

  return <AISanctuaryContext.Provider value={value}>{children}</AISanctuaryContext.Provider>;
}

export function useAISanctuary() {
  const ctx = useContext(AISanctuaryContext);
  if (!ctx) throw new Error("useAISanctuary must be used within AISanctuaryProvider");
  return ctx;
}

/** Register page capabilities; cleanup on unmount. Re-register when contextText or handlers change. */
export function useRegisterAISanctuary(reg: AISanctuaryRegistration) {
  const { register, unregister } = useAISanctuary();

  useEffect(() => {
    register(reg);
    return () => unregister(reg.route);
  }, [register, unregister, reg]);
}
