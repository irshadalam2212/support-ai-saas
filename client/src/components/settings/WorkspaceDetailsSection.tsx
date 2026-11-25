import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import SettingsSection from "@/components/settings/SettingsSection";
import { useCacheWorkspace } from "@/components/settings/useCacheWorkspace";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspace, updateWorkspace, type WorkspaceSummary } from "@/lib/fastapi.api";
import { canManageWorkspace } from "@/lib/roles";

function WorkspaceDetailsForm({ workspace }: { workspace: WorkspaceSummary }) {
  const { session } = useAuth();
  const cacheWorkspace = useCacheWorkspace();
  const [source, setSource] = useState(workspace);
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const canEdit = canManageWorkspace(workspace.role);

  // Reset the fields when newer workspace data arrives.
  if (source !== workspace) {
    setSource(workspace);
    setName(workspace.name);
    setDescription(workspace.description ?? "");
  }

  const updateMutation = useMutation({
    mutationFn: () => updateWorkspace(session!.access_token, workspace.id, {
      name: name.trim(),
      description: description.trim() || null,
    }),
    onSuccess: (saved) => {
      cacheWorkspace(saved);
      setName(saved.name);
      setDescription(saved.description ?? "");
    },
  });
  const changed = name !== workspace.name || description !== (workspace.description ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        updateMutation.mutate();
      }}
    >
      <div className="grid items-start gap-4 sm:grid-cols-2">
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
          <Input
            id="workspace-slug"
            value={workspace.slug}
            readOnly
            aria-describedby="workspace-slug-hint"
            className="bg-muted text-muted-foreground"
          />
          <p id="workspace-slug-hint" className="text-xs text-muted-foreground">Set when the workspace was created.</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspace-description">Description</Label>
        <Textarea
          id="workspace-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={500}
          className="min-h-24 resize-y"
          disabled={!canEdit}
        />
      </div>
      {updateMutation.isError && <Notice tone="error">{updateMutation.error.message}</Notice>}
      {updateMutation.isSuccess && !changed && <Notice tone="success">Workspace details saved.</Notice>}
      {canEdit ? (
        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={updateMutation.isPending || !name.trim() || !changed}
          >
            {updateMutation.isPending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : (
        <Notice tone="info">Only owners and admins can edit workspace details.</Notice>
      )}
    </form>
  );
}

export default function WorkspaceDetailsSection({ workspaceId }: { workspaceId: string }) {
  const { session } = useAuth();
  const workspaceQuery = useQuery({
    queryKey: ["workspace-detail", workspaceId],
    queryFn: () => getWorkspace(session!.access_token, workspaceId),
    enabled: Boolean(session?.access_token),
  });

  return (
    <SettingsSection title="Workspace details" description="The name and description of the selected workspace.">
      {workspaceQuery.isPending ? (
        <LoadingState label="Loading workspace details" />
      ) : workspaceQuery.isError ? (
        <ErrorState
          className="py-2"
          title="Couldn't load workspace details"
          message={workspaceQuery.error.message}
          onRetry={() => void workspaceQuery.refetch()}
          retrying={workspaceQuery.isFetching}
        />
      ) : (
        <WorkspaceDetailsForm workspace={workspaceQuery.data} />
      )}
    </SettingsSection>
  );
}
