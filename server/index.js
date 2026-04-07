/**
 * Minimal AI proxy for production (Render, etc.).
 * Mirrors Vite dev proxy: adds API keys server-side; never expose keys in the browser.
 *
 * Env:
 *   PORT                 — Render sets this
 *   GEMINI_API_KEY       — optional, for Gemini OpenAI-compat endpoint
 *   OPENAI_API_KEY       — optional, for OpenAI
 *   CORS_ORIGINS         — comma-separated allowed origins (e.g. https://your-app.vercel.app)
 */

import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8787);
const GEMINI_KEY = (process.env.GEMINI_API_KEY ?? "").trim();
const OPENAI_KEY = (process.env.OPENAI_API_KEY ?? "").trim();
const CORS_LIST = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function allowOrigin(req) {
  const origin = req.headers.origin;
  if (CORS_LIST.length === 0) {
    console.warn("[sanctuary-api] CORS_ORIGINS empty — allowing any origin (set for production)");
    return origin || "*";
  }
  if (origin && CORS_LIST.includes(origin)) return origin;
  return CORS_LIST[0];
}

function corsHeaders(req) {
  const ao = allowOrigin(req);
  return {
    "Access-Control-Allow-Origin": ao,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

const server = http.createServer(async (req, res) => {
  let pathname = "/";
  try {
    pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
  } catch {
    /* keep default */
  }

  const base = corsHeaders(req);

  if (req.method === "OPTIONS") {
    res.writeHead(204, base);
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, { ...base, "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "sanctuary-api" }));
    return;
  }

  if (req.method === "POST" && pathname === "/api/gemini/chat/completions") {
    if (!GEMINI_KEY) {
      res.writeHead(500, { ...base, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "GEMINI_API_KEY not configured on server" } }));
      return;
    }
    try {
      const body = await readBody(req);
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GEMINI_KEY}`,
          },
          body: body || "{}",
        },
      );
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.writeHead(r.status, { ...base, "Content-Type": ct });
      res.end(text);
    } catch (e) {
      res.writeHead(502, { ...base, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: { message: e instanceof Error ? e.message : "Upstream error" },
        }),
      );
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/openai/v1/chat/completions") {
    if (!OPENAI_KEY) {
      res.writeHead(500, { ...base, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "OPENAI_API_KEY not configured on server" } }));
      return;
    }
    try {
      const body = await readBody(req);
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: body || "{}",
      });
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.writeHead(r.status, { ...base, "Content-Type": ct });
      res.end(text);
    } catch (e) {
      res.writeHead(502, { ...base, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: { message: e instanceof Error ? e.message : "Upstream error" },
        }),
      );
    }
    return;
  }

  res.writeHead(404, { ...base, "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { message: "Not found" } }));
});

server.listen(PORT, () => {
  console.log(`[sanctuary-api] listening on port ${PORT}`);
});
