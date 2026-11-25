import { Navigate, useLocation } from "react-router";

/** Sends old `/dashboard/...` links to the current address, keeping the query and hash. */
export default function LegacyDashboardRedirect() {
  const { pathname, search, hash } = useLocation();
  // Collapse leading slashes so the target can never be read as another host.
  const rest = pathname.replace(/^\/dashboard/, "").replace(/^\/+/, "");

  return <Navigate to={{ pathname: rest ? `/${rest}` : "/overview", search, hash }} replace />;
}
