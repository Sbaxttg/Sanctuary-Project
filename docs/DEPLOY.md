# Deploy: Vercel (frontend) + Render (API)

The React app is a static Vite build. **Nocturnal AI** needs a small server to attach API keys (same role as the Vite dev proxy). That server lives in **`/server`** and is deployed to **Render**.

## 1. Deploy the API on Render

1. Push this repo to GitHub (if it is not already).
2. In [Render](https://render.com): **New → Web Service** → connect the repo.
3. Configure:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free tier is fine to start.
4. **Environment variables** (Render → your service → Environment):
   - `GEMINI_API_KEY` — your Google AI Studio key (if using Gemini).
   - `OPENAI_API_KEY` — only if you use OpenAI instead.
   - `CORS_ORIGINS` — **required for production**: your Vercel site URL(s), comma-separated, no spaces (e.g. `https://sanctuary.vercel.app`). Include `https://www.yourdomain.com` if you add a custom domain later.
5. Deploy and wait until the service is **Live**. Copy the service URL, e.g. `https://sanctuary-api-xxxx.onrender.com`.
6. Optional: open `https://YOUR-API.onrender.com/health` — you should see `{"ok":true,"service":"sanctuary-api"}`.

**Cold starts:** Free Render apps sleep after idle time; the first request after sleep can take ~30–60s.

## 2. Deploy the frontend on Vercel

1. In [Vercel](https://vercel.com): **Add New → Project** → import the same GitHub repo.
2. Framework: **Vite** (auto-detected). **Root Directory:** leave as repository root (not `server`).
3. **Build Command:** `npm run build` (default). **Output:** `dist` (default).
4. **Environment Variables** (Vercel → Project → Settings → Environment Variables). Add for **Production** (and Preview if you want previews to work):

| Name | Notes |
|------|--------|
| `VITE_API_BASE_URL` | Your Render API URL, **no trailing slash**, e.g. `https://sanctuary-api-xxxx.onrender.com` |
| `VITE_AI_PROVIDER` | `gemini` or `openai` (must match which key you set on Render) |
| `VITE_GEMINI_MODEL` | Optional, e.g. `gemini-2.5-flash` |
| `VITE_OPENAI_MODEL` | Optional if using OpenAI |
| `VITE_OPENWEATHER_API_KEY` | For weather (key is still sent from the browser to OpenWeather — acceptable for their public API) |
| `VITE_GOOGLE_CLIENT_ID` | For Gmail; add your **Vercel URL** under Google Cloud → OAuth client → Authorized JavaScript origins |

5. Deploy. After the first deploy, add the **Vercel production URL** to Google OAuth **Authorized JavaScript origins** if you use Gmail.

`vercel.json` includes a SPA fallback so React Router paths (e.g. `/home`) refresh correctly.

## 3. Google OAuth (Gmail)

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your Web client:

- **Authorized JavaScript origins:**  
  `http://localhost:5173`, `https://YOUR-PROJECT.vercel.app`, and any custom domain.
- Redo this whenever you add a new Vercel preview domain if you need Gmail on previews (or use a single production URL only).

## 4. Checklist before sharing the site

- [ ] Render: `CORS_ORIGINS` matches your real Vercel URL(s).
- [ ] Vercel: `VITE_API_BASE_URL` matches Render URL exactly (https, no trailing slash).
- [ ] Vercel: Redeploy after changing env vars (they are baked in at build time).
- [ ] Test Nocturnal AI on the live site once Render has finished waking up.

## Local: API + Vite together

```bash
# Terminal 1 — from repo root (keys in .env still work for Vite proxy in dev)
npm run dev
```

To test the **production-style** client against the local API:

```bash
cd server && npm install && PORT=8787 GEMINI_API_KEY=your_key CORS_ORIGINS=http://localhost:5173 npm start
```

Then in `.env`: `VITE_API_BASE_URL=http://localhost:8787` and restart Vite.
