import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

type Props = { children: React.ReactNode };

/**
 * Wrap routes that need an active session: signed-in user, guest, or dev bypass.
 */
export function RequireAuth({ children }: Props) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate to="/" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
