/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to `"true"` in `.env` for preview/staging builds if you need skip-sign-in without `npm run dev`. */
  readonly VITE_ENABLE_AUTH_BYPASS?: string;
  /** OpenWeatherMap API key — https://openweathermap.org/api */
  readonly VITE_OPENWEATHER_API_KEY?: string;
  /** Production: Render (or other) API origin, no trailing slash — e.g. https://sanctuary-api.onrender.com */
  readonly VITE_API_BASE_URL?: string;
  /** Google OAuth Web client ID — Gmail API + Identity Services */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** `gemini` | `openai` — must match which server-side key you set (GEMINI_API_KEY vs OPENAI_API_KEY). */
  readonly VITE_AI_PROVIDER?: string;
  /** Optional override for Gemini model (default gemini-2.5-flash) */
  readonly VITE_GEMINI_MODEL?: string;
  /** Optional override for Nocturnal AI model (default gpt-4o-mini) */
  readonly VITE_OPENAI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: object) => void };
        };
      };
    };
  }
}

export {};
