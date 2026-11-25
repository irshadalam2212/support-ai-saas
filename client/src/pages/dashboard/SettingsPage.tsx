import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  createWorkspace,
  getAuthenticatedUser,
  getCurrentProfile,
  getWorkspace,
  updateWorkspace,
  type WorkspaceSummary,
} from "@/lib/fastapi.api";

export default function SettingsPage() {
  const { session } = useAuth();
  const { activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const canEdit = activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  const workspaceQuery = useQuery({
    queryKey: ["workspace-detail", activeWorkspace?.id],
    queryFn: () => getWorkspace(session!.access_token, activeWorkspace!.id),
    enabled: Boolean(session?.access_token && activeWorkspace?.id),
  });
  const profileQuery = useQuery({
    queryKey: ["current-profile", session?.user.id],
    queryFn: () => getCurrentProfile(session!.access_token),
    enabled: Boolean(session?.access_token),
  });
  const accountQuery = useQuery({
    queryKey: ["verified-account", session?.user.id],
    queryFn: () => getAuthenticatedUser(session!.access_token),
    enabled: Boolean(session?.access_token),
  });

  useEffect(() => {
    if (!workspaceQuery.data) return;
    setName(workspaceQuery.data.name);
    setDescription(workspaceQuery.data.description ?? "");
  }, [workspaceQuery.data]);

  function cacheWorkspace(workspace: WorkspaceSummary) {
    queryClient.setQueryData(["workspace-detail", workspace.id], workspace);
    if (session) {
      queryClient.setQueryData<WorkspaceSummary[]>(["workspaces", session.user.id], (current) => {
        if (!current) return [workspace];
        return current.some((item) => item.id === workspace.id)
          ? current.map((item) => item.id === workspace.id ? workspace : item)
          : [...current, workspace];
      });
    }
  }

  const updateMutation = useMutation({
    mutationFn: () => updateWorkspace(session!.access_token, activeWorkspace!.id, {
      name: name.trim(),
      description: description.trim() || null,
    }),
    onSuccess: (workspace) => cacheWorkspace(workspace),
  });

  const createMutation = useMutation({
    mutationFn: () => createWorkspace(
      session!.access_token,
      newWorkspaceName.trim(),
      newWorkspaceDescription,
    ),
    onSuccess: (workspace) => {
      cacheWorkspace(workspace);
      setActiveWorkspaceId(workspace.id);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and the selected workspace.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="h-fit p-2">
          <Link to="/dashboard/settings" className="flex w-full rounded-md bg-muted px-3 py-2.5 text-sm font-medium">
            General
          </Link>
          <Link to="/dashboard/settings/assistant" className="flex w-full rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
            AI &amp; Assistant
          </Link>
          <Link to="/dashboard/settings/team" className="flex w-full rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
            Team Members
          </Link>
          <Link to="/dashboard/settings/integrations" className="flex w-full rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
            Integrations
          </Link>
          <Link to="/dashboard/settings/security" className="flex w-full rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
            Security
          </Link>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div>
              <h2 className="font-semibold">Account profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Profile data synchronized with your SupportAI account.
              </p>
            </div>
            <Separator className="my-5" />
            {profileQuery.isLoading || accountQuery.isLoading ? (
              <p className="text-sm text-muted-foreground" role="status">Loading account details…</p>
            ) : profileQuery.isError || accountQuery.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {profileQuery.error?.message ?? accountQuery.error?.message}
              </p>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Name</dt>
                  <dd className="mt-1 text-sm font-medium">{profileQuery.data?.full_name || "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="mt-1 break-all text-sm font-medium">
                    {accountQuery.data?.email ?? profileQuery.data?.email ?? "Not set"}
                  </dd>
                </div>
              </dl>
            )}
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="font-semibold">Workspace details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                View or update the active workspace information.
              </p>
            </div>
            <Separator className="my-5" />
            {!activeWorkspace ? (
              <p className="text-sm text-muted-foreground">Create a workspace to manage its details.</p>
            ) : workspaceQuery.isLoading ? (
              <p className="text-sm text-muted-foreground" role="status">Loading workspace details…</p>
            ) : workspaceQuery.isError ? (
              <p className="text-sm text-destructive" role="alert">{workspaceQuery.error.message}</p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateMutation.mutate();
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace name</Label>
                    <Input
                      id="workspace-name"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-slug">Workspace slug</Label>
                    <Input id="workspace-slug" value={workspaceQuery.data?.slug ?? activeWorkspace.slug} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-description">Description</Label>
                  <Textarea
                    id="workspace-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={500}
                    className="min-h-28 resize-y"
                    disabled={!canEdit}
                  />
                </div>
                {updateMutation.isError && (
                  <p className="text-sm text-destructive" role="alert">{updateMutation.error.message}</p>
                )}
                {updateMutation.isSuccess && (
                  <p className="text-sm text-emerald-700" role="status">Workspace details saved.</p>
                )}
                {canEdit && (
                  <Button type="submit" disabled={updateMutation.isPending || !name.trim()}>
                    {updateMutation.isPending ? "Saving…" : "Save workspace"}
                  </Button>
                )}
                {!canEdit && (
                  <p className="text-xs text-muted-foreground">Only owners and admins can edit workspace details.</p>
                )}
              </form>
            )}
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="font-semibold">Create another workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a separate workspace. You will become its owner and it will be selected automatically.
              </p>
            </div>
            <Separator className="my-5" />
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="new-workspace-name">Workspace name</Label>
                <Input
                  id="new-workspace-name"
                  required
                  maxLength={120}
                  value={newWorkspaceName}
                  onChange={(event) => setNewWorkspaceName(event.target.value)}
                  placeholder="Acme Support"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-workspace-description">Description</Label>
                <Textarea
                  id="new-workspace-description"
                  maxLength={500}
                  value={newWorkspaceDescription}
                  onChange={(event) => setNewWorkspaceDescription(event.target.value)}
                  placeholder="What does this workspace support?"
                  className="min-h-24 resize-y"
                />
              </div>
              {createMutation.isError && (
                <p className="text-sm text-destructive" role="alert">{createMutation.error.message}</p>
              )}
              <Button type="submit" disabled={createMutation.isPending || !newWorkspaceName.trim()}>
                {createMutation.isPending ? "Creating…" : "Create workspace"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
