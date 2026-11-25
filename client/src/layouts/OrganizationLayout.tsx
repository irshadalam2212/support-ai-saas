import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings2,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import { WorkspaceContext } from "@/components/workspace/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { ensureInitialWorkspace, getWorkspaces, type WorkspaceSummary } from "@/lib/fastapi.api";
import { supabase } from "@/lib/supabase";

type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  status?: string;
};

const workspaceItems: NavItem[] = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Conversations", path: "/dashboard/conversations", icon: MessageSquare, status: "Planned" },
  { label: "Customers", path: "/dashboard/customers", icon: Users, status: "Planned" },
  { label: "Knowledge Base", path: "/dashboard/knowledge-base", icon: BookOpen, status: "Planned" },
  { label: "AI Assistant", path: "/dashboard/assistant", icon: Bot, status: "Planned" },
  { label: "Analytics", path: "/dashboard/analytics", icon: ChartNoAxesCombined, status: "Planned" },
];

const managementItems: NavItem[] = [
  { label: "Workspace settings", path: "/dashboard/settings", icon: Settings2 },
  { label: "Team members", path: "/dashboard/settings/team", icon: Users },
  { label: "Billing", path: "/dashboard/billing", icon: CreditCard, status: "Not connected" },
];

const EMPTY_WORKSPACES: WorkspaceSummary[] = [];

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <section className="space-y-1">
      <h2 className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      {items.map(({ label, path, icon: Icon, status }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/dashboard" || path === "/dashboard/settings"}
          className={({ isActive }) =>
            `flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActive
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {status && <span className="shrink-0 text-[10px] text-muted-foreground">{status}</span>}
        </NavLink>
      ))}
    </section>
  );
}

export default function OrganizationLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError("Unable to sign out. Please try again.");
      return;
    }
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r bg-background lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <div>
            <h1 className="text-lg font-semibold">SupportAI</h1>
            <p className="text-xs text-muted-foreground">Customer support workspace</p>
          </div>
        </div>

        <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4">
          <NavGroup title="Workspace" items={workspaceItems} />
          <NavGroup title="Management" items={managementItems} />
        </nav>

        <div className="shrink-0 border-t px-5 py-3 text-xs text-muted-foreground">
          {activeWorkspace ? `${activeWorkspace.role.toLowerCase()} · ${activeWorkspace.name}` : "No workspace selected"}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <div className="min-w-0">
            {workspacesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground" role="status">Loading workspace…</p>
            ) : workspacesQuery.isError ? (
              <p className="text-sm text-destructive" role="alert">Could not load workspaces</p>
            ) : workspaces.length > 1 ? (
              <select
                aria-label="Active workspace"
                className="h-9 max-w-48 rounded-md border bg-background px-3 text-sm font-semibold sm:max-w-64"
                value={activeWorkspace?.id ?? ""}
                onChange={(event) => changeActiveWorkspace(event.target.value)}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                ))}
              </select>
            ) : (
              <h2 className="max-w-52 truncate font-semibold sm:max-w-none">{activeWorkspace?.name ?? "Workspace"}</h2>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {activeWorkspace ? `${activeWorkspace.role.toLowerCase()} workspace` : "Workspace"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-52 truncate text-sm font-medium">{session?.user.email}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void handleSignOut()}>
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <nav aria-label="Mobile navigation" className="flex shrink-0 gap-1 overflow-x-auto border-b bg-background p-2 lg:hidden">
          {[...workspaceItems, ...managementItems].map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard" || path === "/dashboard/settings"}
              className={({ isActive }) =>
                `shrink-0 rounded-md px-3 py-2 text-xs ${isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {signOutError && (
          <p className="shrink-0 border-b border-destructive/30 bg-destructive/5 px-6 py-2 text-sm text-destructive" role="alert">
            {signOutError}
          </p>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <WorkspaceContext.Provider value={workspaceContext}>
            <Outlet />
          </WorkspaceContext.Provider>
        </main>
      </div>
    </div>
  );
}
