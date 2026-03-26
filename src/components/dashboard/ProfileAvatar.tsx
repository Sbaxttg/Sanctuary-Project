import type { PublicProfile } from "../../lib/auth";

const FALLBACK_GRADIENT = "linear-gradient(135deg, #6366f1, #0f172a)";

function initialsFor(p: PublicProfile): string {
  const a = p.firstName.trim().charAt(0);
  const b = p.lastName.trim().charAt(0);
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase();
  const d = p.displayName.trim();
  if (d.length >= 2) return d.slice(0, 2).toUpperCase();
  if (d.length === 1) return d.toUpperCase();
  return p.kind === "guest" ? "G" : "?";
}

type Props = {
  profile: PublicProfile;
  size?: number;
  className?: string;
  ringClassName?: string;
  onClick?: () => void;
};

export function ProfileAvatar({ profile, size = 40, className = "", ringClassName = "", onClick }: Props) {
  const styleDim = { width: size, height: size };
  const initials = initialsFor(profile);

  const ring = `shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 ${ringClassName} ${className}`;
  const hover = onClick ? "cursor-pointer transition hover:ring-app-primary/50" : "";

  if (profile.avatarDataUrl) {
    const img = (
      <img
        src={profile.avatarDataUrl}
        alt=""
        className="h-full w-full object-cover"
        width={size}
        height={size}
      />
    );
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={`${ring} ${hover}`}
          style={styleDim}
          aria-label="Open profile settings"
        >
          {img}
        </button>
      );
    }
    return (
      <div className={ring} style={styleDim}>
        {img}
      </div>
    );
  }

  const face = (
    <span
      className={`flex h-full w-full items-center justify-center text-[11px] font-bold uppercase tracking-tight text-white`}
      style={{ background: FALLBACK_GRADIENT }}
    >
      {initials}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${ring} ${hover}`}
        style={styleDim}
        aria-label="Open profile settings"
      >
        {face}
      </button>
    );
  }

  return (
    <div className={ring} style={styleDim}>
      {face}
    </div>
  );
}
