import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import { WorkspaceContext } from "@/components/workspace/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { ensureInitialWorkspace, getWorkspaces, type WorkspaceSummary } from "@/lib/fastapi.api";
import { supabase } from "@/lib/supabase";

type NavItem = {
    label: string;
    path: string;
};

const workspaceItems: NavItem[] = [
    {
        label: "Overview",
        path: "/dashboard",
    },
    {
        label: "Conversations",
        path: "/dashboard/conversations",
    },
    {
        label: "Knowledge Base",
        path: "/dashboard/knowledge-base",
    },
    {
        label: "AI Assistant",
        path: "/dashboard/assistant",
    },
    {
        label: "Analytics",
        path: "/dashboard/analytics",
    },
    {
        label: "Customers",
        path: "/dashboard/customers",
    },
    {
        label: "Settings",
        path: "/dashboard/settings",
    },
];

const managementItems: NavItem[] = [
    {
        label: "Settings",
        path: "/dashboard/settings",
    },
    {
        label: "Billing",
        path: "/dashboard/billing",
    }
]

const EMPTY_WORKSPACES: WorkspaceSummary[] = [];

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
        <div className="flex min-h-screen bg-muted/30">
            <aside className="hidden w-64 border-r bg-background lg:block">
                <div className="flex h-16 items-center border-b px-6">
                    <div>
                        <h1 className="text-lg font-semibold">Support AI</h1>
                        <p className="text-xs text-muted-foreground">
                            AI Support Platform
                        </p>
                    </div>
                </div>

                <nav className="space-y-1 p-4">
                    <p className="mb-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                        Workspace
                    </p>

                    {workspaceItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.path === "/dashboard"}
                            className={({ isActive }) =>
                                `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                    ? "bg-muted font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`
                            }
                        >
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <p className="mb-2 mt-6 px-3 text-xs font-medium uppercase text-muted-foreground">
                        Management
                    </p>

                    {managementItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.path === "/dashboard"}
                            className={({ isActive }) =>
                                `flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                    ? "bg-muted font-medium text-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`
                            }
                        >
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-background px-6">
                    <div className="min-w-0">
                        {workspacesQuery.isLoading ? (
                            <p className="text-sm text-muted-foreground" role="status">Loading workspace…</p>
                        ) : workspacesQuery.isError ? (
                            <p className="text-sm text-destructive" role="alert">Could not load workspaces</p>
                        ) : workspaces.length > 1 ? (
                            <select
                                aria-label="Active workspace"
                                className="h-9 max-w-64 rounded-md border bg-background px-3 text-sm font-semibold"
                                value={activeWorkspace?.id ?? ""}
                                onChange={(event) => changeActiveWorkspace(event.target.value)}
                            >
                                {workspaces.map((workspace) => (
                                    <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                                ))}
                            </select>
                        ) : (
                            <h2 className="truncate font-semibold">{activeWorkspace?.name ?? "No workspace"}</h2>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {activeWorkspace ? `${activeWorkspace.role.toLowerCase()} workspace` : "Workspace"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">{session?.user.email}</p>
                            <p className="text-xs text-muted-foreground">
                                Organisation Admin
                            </p>
                        </div>

                        <Button type="button" variant="outline" size="sm" onClick={() => void handleSignOut()}>
                            <LogOut aria-hidden="true" />
                            Sign out
                        </Button>
                    </div>
                </header>

                {signOutError && (
                    <p className="border-b border-destructive/30 bg-destructive/5 px-6 py-2 text-sm text-destructive" role="alert">
                        {signOutError}
                    </p>
                )}

                <main className="flex-1 p-6">
                    <WorkspaceContext.Provider value={workspaceContext}>
                        <Outlet />
                    </WorkspaceContext.Provider>
                </main>
            </div>
        </div>
    );
}
