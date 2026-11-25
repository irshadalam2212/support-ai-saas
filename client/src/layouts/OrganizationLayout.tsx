import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { useSidebarPreference } from "@/components/layout/useSidebarPreference";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Notice from "@/components/shared/Notice";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceContext } from "@/components/workspace/WorkspaceContext";
import { ensureInitialWorkspace, getWorkspaces, type WorkspaceSummary } from "@/lib/fastapi.api";
import { supabase } from "@/lib/supabase";

const EMPTY_WORKSPACES: WorkspaceSummary[] = [];

export default function OrganizationLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useSidebarPreference();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    () => localStorage.getItem("supportai.activeWorkspaceId") ?? "",
  );
  const workspacesQuery = useQuery({
    queryKey: ["workspaces", session?.user.id],
    queryFn: async () => {
      if (!session) return [];
      const existing = await getWorkspaces(session.access_token);
      if (existing.length > 0) return existing;
      return [await ensureInitialWorkspace(session.access_token)];
    },
    enabled: !!session,
  });
  const workspaces = workspacesQuery.data ?? EMPTY_WORKSPACES;
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId)
    ?? workspaces[0]
    ?? null;

  useEffect(() => {
    if (activeWorkspace && activeWorkspace.id !== activeWorkspaceId) {
      localStorage.setItem("supportai.activeWorkspaceId", activeWorkspace.id);
    }
  }, [activeWorkspace, activeWorkspaceId]);

  // The content area scrolls, not the window, so reset it on navigation.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const changeActiveWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem("supportai.activeWorkspaceId", workspaceId);
  }, []);

  const workspaceContext = useMemo(() => ({
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId: changeActiveWorkspace,
  }), [workspaces, activeWorkspace, changeActiveWorkspace]);

  const handleSignOut = async () => {
    setSignOutError("");
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      setSignOutError("Unable to sign out. Please try again.");
      return;
    }
    navigate("/login", { replace: true });
  };

  return (
    <WorkspaceContext.Provider value={workspaceContext}>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        // The collapsed rail is wider on touch screens so its buttons can be 44px.
        className="h-dvh min-h-0 overflow-hidden pointer-coarse:[--sidebar-width-icon:3.75rem]!"
      >
        <a
          href="#main-content"
          className="sr-only z-50 rounded-lg bg-primary text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {/* Without a provider, tooltips on the collapsed rail wait 600ms. */}
        <TooltipProvider>
          <AppSidebar />
        </TooltipProvider>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppHeader signingOut={signingOut} onSignOut={() => void handleSignOut()} />

          {signOutError && <Notice tone="error" className="rounded-none border-x-0 border-t-0">{signOutError}</Notice>}

          <main
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30 p-4 outline-none sm:p-6"
          >
            <div className="mx-auto w-full max-w-5xl">
              {workspacesQuery.isPending ? (
                <LoadingState label="Loading your workspace" rows={5} />
              ) : !activeWorkspace && workspacesQuery.isError ? (
                <ErrorState
                  title="Couldn't load your workspace"
                  message={workspacesQuery.error.message}
                  onRetry={() => void workspacesQuery.refetch()}
                  retrying={workspacesQuery.isFetching}
                />
              ) : (
                <Outlet />
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </WorkspaceContext.Provider>
  );
}
