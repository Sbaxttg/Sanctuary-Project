import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const openaiKey = (env.OPENAI_API_KEY ?? "").trim();
  const geminiKey = (env.GEMINI_API_KEY ?? "").trim();

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/openai": {
          target: "https://api.openai.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (openaiKey) {
                proxyReq.setHeader("Authorization", `Bearer ${openaiKey}`);
              }
            });
          },
        },
        "/api/gemini": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gemini/, "/v1beta/openai"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (geminiKey) {
                proxyReq.setHeader("Authorization", `Bearer ${geminiKey}`);
              }
            });
          },
        },
      },
    },
  };
});
