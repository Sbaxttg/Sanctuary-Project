# Sanctuary — Digital Workspace

## Sign-in page

React + Vite + Tailwind CSS.

### Setup

**Use Node 20 LTS** (recommended). With [nvm](https://github.com/nvm-sh/nvm):

```bash
cd Sanctuary-Project
nvm use   # reads .nvmrc → Node 20
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Nocturnal AI (Google Gemini or OpenAI)

The **Nocturnal AI** panel (bottom-right on every app page except sign-in) uses **function calling** so it can answer questions and perform in-app actions (calendar events, note search, compose drafts, fitness routine rows, quote shuffle, etc.).

**Google Gemini (recommended free tier)** — uses Google’s [OpenAI-compatible](https://ai.google.dev/gemini-api/docs/openai) endpoint:

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. In `.env`:

   ```bash
   VITE_AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key_here
   ```

3. Optional: `VITE_GEMINI_MODEL=gemini-2.0-flash` (default).
4. Run **`npm run dev`**. Requests go through Vite’s proxy at `/api/gemini`, so the browser never receives your secret key.

**OpenAI** instead:

1. Create a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. In `.env`:

   ```bash
   VITE_AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   ```

3. Optional: `VITE_OPENAI_MODEL=gpt-4o-mini` (default).

**Production / `npm run preview`:** the proxy only runs in dev. For a static deploy, add a small backend or serverless route that forwards chat completions with your key.

### If `npm install` fails (`esbuild`, `TAR_ENTRY_ERROR`, `vite: command not found`)

1. **Free disk space** — low disk space breaks tar extraction.
2. **Pause antivirus / “safe” folder tools** — they sometimes `SIGKILL` install scripts.
3. **Clean reinstall** (from project folder):

   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

4. **Switch to Node 20**: `nvm install 20 && nvm use 20` (Node 24 can be flaky with native tooling).
5. **Apple Silicon**: if `@esbuild/darwin-arm64` still fails, try:

   ```bash
   npm install @esbuild/darwin-arm64 --save-dev
   npm install
   ```

### Weather page (OpenWeatherMap)

1. Create a free account and API key at [openweathermap.org/api](https://openweathermap.org/api) (under **API keys** in your profile). **New keys can take up to ~2 hours** before requests succeed.
2. Copy `.env.example` to `.env` and set:

   ```bash
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

3. Restart `npm run dev`. Search by **city name** (e.g. `Paris`, `Tokyo`) or **US ZIP** (`90210`); use **Use my location** for GPS-based weather (works on `localhost` and HTTPS).

If you see **401 Invalid API key**, double-check the key in `.env`, restart the dev server, or wait until the key has finished activating on OpenWeather’s side.

### Email page (Gmail sync)

1. In [Google Cloud Console](https://console.cloud.google.com/), select or create a project.
2. Enable **[Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)** for that project.
3. Open **APIs & Services → [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)**. Choose **External** (unless you use Google Workspace and prefer Internal), fill the required app name / support email, and add **Scopes** for Gmail — at minimum the app requests `gmail.modify` and `gmail.send` (add them under “Add or remove scopes” → Gmail). While publishing status is **Testing**, add your own Google account under **Test users** so you can sign in.
4. Open **APIs & Services → [Credentials](https://console.cloud.google.com/apis/credentials)** → **Create credentials** → **OAuth client ID** → application type **Web application**. Under **Authorized JavaScript origins**, add exactly your app origin, e.g. `http://localhost:5173` (include the port). You typically do **not** need an authorized redirect URI for this Vite app.
5. Copy `.env.example` to `.env` (if you do not already have one) and set:

   ```bash
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

6. Restart `npm run dev`. On **Email**, click **Sync Gmail**, choose your Google account, and allow access. **Compose** opens a modal; **Archive / Delete / Spam / Star** use the Gmail API when a message is selected.

If Google shows **access_denied** or **403**, check that the Gmail API is enabled, the consent screen includes the Gmail scopes, and (in Testing mode) your account is listed as a test user.

### Build

```bash
npm run build
npm run preview
```

### Sign-in bypass (while building)

- On **`npm run dev`**, the sign-in screen shows **Continue without signing in** — it opens **`/home`** (dashboard) and saves a dev flag in the browser.
- **Sign in** (demo) also routes to **`/home`** until real auth is wired.
- **Sign out (preview)** on the home page clears that flag so you can test the login UI again.
- For production/preview builds, bypass is **off** unless you set `VITE_ENABLE_AUTH_BYPASS=true` (see `.env.example`).
- Later, implement real auth in `src/lib/auth.ts` and keep using **`RequireAuth`** around private routes.
