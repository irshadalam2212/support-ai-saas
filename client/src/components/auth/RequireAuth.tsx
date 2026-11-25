import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";

export default function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main role="status" className="flex min-h-dvh items-center justify-center gap-2 px-6 text-sm text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        Checking your session…
      </main>
    );
  }

  if (!session) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
