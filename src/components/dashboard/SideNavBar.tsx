import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getPublicProfile, SANCTUARY_PROFILE_CHANGED } from "../../lib/auth";
import { useProfileModal } from "../../context/ProfileModalContext";
import { ProfileAvatar } from "./ProfileAvatar";

function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function NotesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}
function FitnessIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

const navItemClass = (isActive: boolean) =>
  [
    "group relative flex w-full items-center gap-3 rounded-xl py-3 pl-3 pr-4 text-left text-[14px] font-semibold transition-colors",
    isActive
      ? "bg-[#151a21] text-white"
      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
  ].join(" ");

const calendarNavClass = (isActive: boolean) =>
  [
    "group relative flex w-full items-center gap-3 rounded-xl border-l-4 py-3 pl-2 pr-4 text-left text-[14px] font-semibold transition-colors",
    isActive
      ? "border-app-primary bg-[#1b2028] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
  ].join(" ");

/** Active state for Fitness page — right accent bar per design system */
const fitnessNavClass = (isActive: boolean) =>
  [
    "group relative flex w-full items-center gap-3 rounded-xl py-3 pl-3 pr-4 text-left text-[14px] font-semibold transition-colors",
    isActive
      ? "border-r-2 border-[#2962FF] bg-[#151a21] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
  ].join(" ");

export function SideNavBar() {
  const [profile, setProfile] = useState(() => getPublicProfile());
  const { openProfile } = useProfileModal();

  useEffect(() => {
    const bump = () => setProfile(getPublicProfile());
    window.addEventListener(SANCTUARY_PROFILE_CHANGED, bump);
    return () => window.removeEventListener(SANCTUARY_PROFILE_CHANGED, bump);
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/5 bg-[#0f141a]">
      <div className="px-6 pt-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-sky-50">The Sanctuary</h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
          Premium productivity
        </p>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1 px-3" aria-label="Main">
        <NavLink to="/home" end className={({ isActive }) => navItemClass(isActive)}>
          {({ isActive }) => (
            <>
              <HomeIcon />
              <span>Home</span>
              {isActive && (
                <span
                  className="absolute right-2 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-app-primary shadow-[0_0_12px_rgba(41,98,255,0.7)]"
                  aria-hidden
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/notes" className={({ isActive }) => navItemClass(isActive)}>
          {({ isActive }) => (
            <>
              <NotesIcon />
              <span>Notes</span>
              {isActive && (
                <span
                  className="absolute right-2 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-app-primary shadow-[0_0_12px_rgba(41,98,255,0.7)]"
                  aria-hidden
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/email" className={({ isActive }) => navItemClass(isActive)}>
          {({ isActive }) => (
            <>
              <MailIcon />
              <span>Email</span>
              {isActive && (
                <span
                  className="absolute right-2 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-app-primary shadow-[0_0_12px_rgba(41,98,255,0.7)]"
                  aria-hidden
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) => calendarNavClass(isActive)}>
          <CalendarIcon />
          <span>Calendar</span>
        </NavLink>

        <NavLink to="/weather" className={({ isActive }) => navItemClass(isActive)}>
          {({ isActive }) => (
            <>
              <span className={isActive ? "text-app-primary" : ""}>
                <CloudIcon />
              </span>
              <span>Weather</span>
              {isActive && (
                <span
                  className="absolute right-2 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-app-primary shadow-[0_0_16px_rgba(41,98,255,0.85)]"
                  aria-hidden
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/fitness" className={({ isActive }) => fitnessNavClass(isActive)}>
          {({ isActive }) => (
            <>
              <span className={isActive ? "text-[#2962FF]" : ""}>
                <FitnessIcon />
              </span>
              <span>Fitness</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="border-t border-white/5 p-4">
        <button
          type="button"
          onClick={openProfile}
          className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3 text-left transition hover:border-white/10 hover:bg-white/[0.04]"
        >
          <ProfileAvatar profile={profile} size={40} ringClassName="ring-white/10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{profile.displayName}</p>
            <p className="truncate text-[12px] font-medium text-slate-500">{profile.subtitle}</p>
          </div>
          <span className="shrink-0 text-slate-500" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </aside>
  );
}
