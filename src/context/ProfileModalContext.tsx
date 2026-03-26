import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ProfileEditorModal } from "../components/dashboard/ProfileEditorModal";

type Ctx = {
  openProfile: () => void;
};

const ProfileModalContext = createContext<Ctx | null>(null);

export function ProfileModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openProfile = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openProfile }), [openProfile]);

  return (
    <ProfileModalContext.Provider value={value}>
      {children}
      <ProfileEditorModal open={open} onClose={() => setOpen(false)} />
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal(): Ctx {
  const ctx = useContext(ProfileModalContext);
  if (!ctx) throw new Error("useProfileModal must be used within ProfileModalProvider");
  return ctx;
}
