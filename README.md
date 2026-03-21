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

1. Create a free API key at [openweathermap.org/api](https://openweathermap.org/api).
2. Copy `.env.example` to `.env` and set:

   ```bash
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

3. Restart `npm run dev`. Search by **city** or **US ZIP**; use **Use my location** for GPS-based weather.

### Email page (Gmail sync)

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project (or pick one), enable **Gmail API**, and create **OAuth 2.0 Client ID** credentials of type **Web application**.
2. Under **Authorized JavaScript origins**, add your dev origin (e.g. `http://localhost:5173`) and any deployed URL.
3. Copy `.env.example` to `.env` and set:

   ```bash
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

4. Restart `npm run dev`. On **Email**, click **Sync Gmail** to sign in with Google and load messages. **Compose** opens a modal; **Archive / Delete / Spam / Star** call the Gmail API when a message is selected.

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
