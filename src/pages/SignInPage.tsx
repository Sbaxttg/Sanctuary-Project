import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  hasDevBypass,
  isAuthBypassFeatureEnabled,
  setDevBypass,
} from "../lib/auth";

function ShieldIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 3L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SignInPage() {
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo: until real auth, signing in uses the same dev session as “skip”
    setDevBypass();
    navigate("/home", { replace: true });
  }

  function handleDevBypass() {
    setDevBypass();
    navigate("/home", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e14] font-sans text-slate-100 antialiased">
      {/* Ambient depth — keeps premium contrast vs flat fill */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_20%,rgba(41,98,255,0.08),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(15,20,26,0.9),transparent_50%)]"
        aria-hidden
      />

      {/* Session status — primary accent */}
      <div className="absolute right-8 top-8 z-10 flex items-center gap-3 sm:right-10 sm:top-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Session status: Secure
        </span>
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-app-primary shadow-[0_0_16px_rgba(41,98,255,0.75)]"
          aria-hidden
        />
      </div>

      <main className="relative z-[1] flex min-h-screen items-center justify-center px-6 pb-48 pt-28 sm:px-8 sm:pb-32">
        {/* Surface card — tokens: surface + border + deep shadow + gradient veil */}
        <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/5 bg-[#0f141a] shadow-deep">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-[#2962FF]/[0.06]"
            aria-hidden
          />
          <div className="relative px-8 pb-10 pt-10 sm:px-10 sm:pb-12 sm:pt-12">
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#0c1016] text-app-primary shadow-primary-glow">
                <ShieldIcon />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Sanctuary
              </h1>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Digital workspace
              </p>
              <p className="mt-6 max-w-[18rem] font-serif text-lg font-light italic leading-snug tracking-tight text-slate-200">
                &ldquo;Calm, secure access to what matters.&rdquo;
              </p>
            </div>

            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-white sm:text-[26px]">
              Sign in
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <label className="block">
                <span className="sr-only">Email address</span>
                <div className="flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-app-input px-4 transition-colors focus-within:border-app-primary/50 focus-within:shadow-[0_0_0_1px_rgba(41,98,255,0.35)]">
                  <span className="flex shrink-0 text-slate-500">
                    <UserIcon />
                  </span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email address"
                    className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="sr-only">Password</span>
                <div className="flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-app-input px-4 transition-colors focus-within:border-app-primary/50 focus-within:shadow-[0_0_0_1px_rgba(41,98,255,0.35)]">
                  <span className="flex shrink-0 text-slate-500">
                    <LockIcon />
                  </span>
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 outline-none"
                  />
                </div>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex cursor-pointer select-none items-center gap-3 text-[14px] font-medium text-slate-400">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="app-checkbox"
                  />
                  Remember me
                </label>
                <a
                  href="#forgot"
                  className="text-[14px] font-semibold text-app-primary transition hover:text-white"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="h-14 w-full rounded-xl bg-app-primary text-[15px] font-bold text-white shadow-[0_16px_40px_-12px_rgba(41,98,255,0.55)] transition hover:brightness-110 active:translate-y-px"
              >
                Sign in
              </button>

              <p className="pt-2 text-center text-[14px] font-medium leading-relaxed text-slate-400">
                Don&apos;t have an account?{" "}
                <a
                  href="#create"
                  className="font-bold text-app-primary transition hover:text-white hover:underline"
                >
                  Create account
                </a>
              </p>
            </form>

            {isAuthBypassFeatureEnabled() && (
              <div className="mt-8 border-t border-white/10 pt-8">
                <button
                  type="button"
                  onClick={handleDevBypass}
                  className="w-full rounded-xl border border-white/15 bg-[#0c1016] py-3.5 text-sm font-semibold text-slate-200 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.4)] transition hover:border-app-primary/45 hover:bg-white/[0.04]"
                >
                  Continue without signing in
                </button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
                  Development preview only — swap for real sign-up when you wire
                  authentication.
                </p>
              </div>
            )}

            {hasDevBypass() && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="text-sm font-semibold text-app-primary underline-offset-4 hover:text-white hover:underline"
                >
                  Open home (dev session saved in this browser)
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer strip — 24px / 32px grid alignment */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 grid grid-cols-1 gap-6 px-8 pb-8 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:grid-cols-3 sm:items-end">
        <div className="flex items-center gap-3 justify-self-start">
          <span className="h-px w-8 bg-white/20" aria-hidden />
          <span>Encryption standard v4.2</span>
        </div>
        <p className="justify-self-center text-center normal-case tracking-normal">
          © 2024 Midnight Velocity Ecosystem
        </p>
        <div className="hidden sm:block" aria-hidden />
      </div>

      {/* AI widget — spec: w-80, glass, bottom-right */}
      <aside
        className="fixed bottom-8 right-8 z-20 w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-deep backdrop-blur-2xl"
        aria-label="AI assistant"
      >
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <span className="text-app-primary">
              <SparkIcon />
            </span>
            Assistant
          </div>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Ask about access, security, or your workspace.
          </p>
        </div>
        <div className="p-6 pt-4">
          <div className="flex gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <input
              type="text"
              readOnly
              placeholder="How can I help you today?"
              className="w-full bg-transparent text-sm font-medium text-slate-200 placeholder:text-slate-500 outline-none"
            />
          </div>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            End-to-end encrypted session
          </p>
        </div>
      </aside>
    </div>
  );
}
