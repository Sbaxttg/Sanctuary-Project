import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

type Props = { children: React.ReactNode };

/**
 * Wrap routes that should require sign-in later.
 * Today: allows access if dev bypass is set OR (future) real session exists.
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
