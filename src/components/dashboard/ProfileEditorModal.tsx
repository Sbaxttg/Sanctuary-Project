import { useEffect, useRef, useState } from "react";
import {
  getPublicProfile,
  SANCTUARY_PROFILE_CHANGED,
  updateUserProfile,
  type PublicProfile,
} from "../../lib/auth";
import { ProfileAvatar } from "./ProfileAvatar";

const MAX_DATA_URL_CHARS = 320_000;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, or WebP).");
  }
  const bitmap = await createImageBitmap(file);
  const maxEdge = 320;
  let w = bitmap.width;
  let h = bitmap.height;
  if (w > maxEdge || h > maxEdge) {
    const s = maxEdge / Math.max(w, h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  let quality = 0.9;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("Image is still too large after compression. Try a smaller photo.");
  }
  return dataUrl;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProfileEditorModal({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<PublicProfile>(() => getPublicProfile());
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const p = getPublicProfile();
    setProfile(p);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setAvatarDataUrl(p.avatarDataUrl);
    setError(null);
  }, [open]);

  useEffect(() => {
    const onChanged = () => {
      if (!open) return;
      setProfile(getPublicProfile());
    };
    window.addEventListener(SANCTUARY_PROFILE_CHANGED, onChanged);
    return () => window.removeEventListener(SANCTUARY_PROFILE_CHANGED, onChanged);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const draftProfile: PublicProfile = {
    ...profile,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    displayName: [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || profile.displayName,
    avatarDataUrl,
  };

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const url = await fileToCompressedDataUrl(file);
      setAvatarDataUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load image.");
    }
  }

  function handleSave() {
    if (!profile.canEdit || profile.kind !== "user" || !profile.userId) {
      onClose();
      return;
    }
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setError("First and last name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      updateUserProfile(profile.userId, {
        firstName: fn,
        lastName: ln,
        avatarDataUrl,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[200] cursor-default bg-black/60 backdrop-blur-sm"
        aria-label="Close profile"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-[210] w-[min(100vw-2rem,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0f141a] p-6 shadow-deep"
        role="dialog"
        aria-labelledby="profile-editor-title"
      >
        <h2 id="profile-editor-title" className="text-xl font-bold text-white">
          Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {profile.canEdit
            ? "Update how you appear in The Sanctuary."
            : "Sign in with an account to customize your profile."}
        </p>

        {!profile.canEdit ? (
          <div className="mt-6 flex justify-center">
            <ProfileAvatar profile={profile} size={96} />
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-col items-center gap-4">
              <ProfileAvatar profile={draftProfile} size={96} />
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-app-primary/40 hover:text-white"
                >
                  Change photo
                </button>
                {avatarDataUrl ? (
                  <button
                    type="button"
                    onClick={() => setAvatarDataUrl(null)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-red-500/40 hover:text-red-300"
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onPickFile}
              />
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-app-input px-4 py-3 text-sm font-medium text-white outline-none focus:border-app-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-app-input px-4 py-3 text-sm font-medium text-white outline-none focus:border-app-primary/50"
                />
              </label>
            </div>
          </>
        )}

        {error ? (
          <p className="mt-4 text-sm font-medium text-red-300" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            {profile.canEdit ? "Cancel" : "Close"}
          </button>
          {profile.canEdit ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl bg-app-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(41,98,255,0.35)] transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
