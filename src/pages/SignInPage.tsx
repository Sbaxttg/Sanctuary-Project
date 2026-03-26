import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  continueAsGuest,
  isAuthenticated,
  isAuthBypassFeatureEnabled,
  signIn,
  signInDevBypass,
  signUp,
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
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("/home", { replace: true });
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        const r = await signUp(email, password, firstName, lastName);
        if (!r.ok) {
          setError(r.error);
          return;
        }
        navigate("/home", { replace: true });
        return;
      }
      const r = await signIn(email, password, remember);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      navigate("/home", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  function handleGuest() {
    setError(null);
    continueAsGuest();
    navigate("/home", { replace: true });
  }

  function handleDevBypass() {
    setError(null);
    signInDevBypass();
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
                The Sanctuary
              </h1>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Digital workspace
              </p>
              <p className="mt-6 max-w-[18rem] font-serif text-lg font-light italic leading-snug tracking-tight text-slate-200">
                &ldquo;Calm, secure access to what matters.&rdquo;
              </p>
            </div>

            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-white sm:text-[26px]">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h2>

            <p className="mb-6 text-center text-[12px] leading-relaxed text-slate-500">
              Accounts are stored on <span className="font-semibold text-slate-400">this device only</span>{" "}
              (not sent to a server). Use the same email and password when you return.
            </p>

            {error && (
              <div
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
                role="alert"
              >
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 rounded-xl border border-app-primary/25 bg-app-primary/10 px-4 py-3 text-sm font-medium text-slate-200">
                {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {mode === "signup" && (
                <>
                  <label className="block">
                    <span className="sr-only">First name</span>
                    <div className="flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-app-input px-4 transition-colors focus-within:border-app-primary/50 focus-within:shadow-[0_0_0_1px_rgba(41,98,255,0.35)]">
                      <span className="flex shrink-0 text-slate-500">
                        <UserIcon />
                      </span>
                      <input
                        type="text"
                        name="firstName"
                        autoComplete="given-name"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="sr-only">Last name</span>
                    <div className="flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-app-input px-4 transition-colors focus-within:border-app-primary/50 focus-within:shadow-[0_0_0_1px_rgba(41,98,255,0.35)]">
                      <span className="flex shrink-0 text-slate-500">
                        <UserIcon />
                      </span>
                      <input
                        type="text"
                        name="lastName"
                        autoComplete="family-name"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </label>
                </>
              )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 outline-none"
                  />
                </div>
              </label>

              {mode === "signup" && (
                <label className="block">
                  <span className="sr-only">Confirm password</span>
                  <div className="flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-app-input px-4 transition-colors focus-within:border-app-primary/50 focus-within:shadow-[0_0_0_1px_rgba(41,98,255,0.35)]">
                    <span className="flex shrink-0 text-slate-500">
                      <LockIcon />
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-full w-full min-w-0 bg-transparent text-[15px] font-medium text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </label>
              )}

              {mode === "signin" && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="flex cursor-pointer select-none items-center gap-3 text-[14px] font-medium text-slate-400">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="app-checkbox"
                    />
                    Remember me on this device
                  </label>
                  <button
                    type="button"
                    className="text-[14px] font-semibold text-app-primary transition hover:text-white"
                    onClick={() => {
                      setInfo(
                        "Passwords are not recoverable from the cloud — they stay in this browser. You can create a new account or use guest mode.",
                      );
                      setError(null);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-14 w-full rounded-xl bg-app-primary text-[15px] font-bold text-white shadow-[0_16px_40px_-12px_rgba(41,98,255,0.55)] transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>

              <p className="pt-2 text-center text-[14px] font-medium leading-relaxed text-slate-400">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="font-bold text-app-primary transition hover:text-white hover:underline"
                      onClick={() => {
                        setMode("signup");
                        setError(null);
                        setInfo(null);
                        setFirstName("");
                        setLastName("");
                      }}
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-bold text-app-primary transition hover:text-white hover:underline"
                      onClick={() => {
                        setMode("signin");
                        setError(null);
                        setInfo(null);
                        setConfirmPassword("");
                        setFirstName("");
                        setLastName("");
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>

            <div className="mt-8 border-t border-white/10 pt-8">
              <button
                type="button"
                onClick={handleGuest}
                className="w-full rounded-xl border border-white/15 bg-[#0c1016] py-3.5 text-sm font-semibold text-slate-200 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.4)] transition hover:border-app-primary/45 hover:bg-white/[0.04]"
              >
                Continue without signing in
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
                Guest mode keeps notes, calendar, fitness, and weather preferences only for this browser tab
                session. Sign out clears them; they won&apos;t come back after you close the tab.
              </p>
            </div>

            {isAuthBypassFeatureEnabled() && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleDevBypass}
                  className="text-xs font-semibold text-slate-500 underline-offset-4 hover:text-app-primary hover:underline"
                >
                  Dev: skip auth (legacy local storage)
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
