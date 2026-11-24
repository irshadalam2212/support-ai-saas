import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthContext";

export default function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground" role="status">
        Checking your session…
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname }} />;
  }

  return <Outlet />;
}
