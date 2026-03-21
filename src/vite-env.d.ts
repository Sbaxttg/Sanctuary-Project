/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to `"true"` in `.env` for preview/staging builds if you need skip-sign-in without `npm run dev`. */
  readonly VITE_ENABLE_AUTH_BYPASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
