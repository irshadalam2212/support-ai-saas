import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import { useCacheWorkspace } from "@/components/settings/useCacheWorkspace";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Notice from "@/components/shared/Notice";
import { describeMemberAction, type MemberAction } from "@/components/team/memberAction";
import MemberList from "@/components/team/MemberList";
import { Card } from "@/components/ui/card";
import {
  getWorkspaceMembers,
  removeWorkspaceMember,
  transferWorkspaceOwnership,
  updateWorkspaceMemberRole,
  type WorkspaceSummary,
} from "@/lib/fastapi.api";

export default function MembersSection({ workspace }: { workspace: WorkspaceSummary }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const cacheWorkspace = useCacheWorkspace();
  const queryKey = ["workspace-members", workspace.id];
  // The action stays set while the dialog closes so its text does not vanish.
  const [action, setAction] = useState<MemberAction | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const context = { workspaceName: workspace.name, actorRole: workspace.role };
  const wording = action ? describeMemberAction(action, context) : null;

  const membersQuery = useQuery({
    queryKey,
    queryFn: () => getWorkspaceMembers(session!.access_token, workspace.id),
    enabled: Boolean(session?.access_token),
  });

  const actionMutation = useMutation({
    mutationFn: async (pending: MemberAction) => {
      const token = session!.access_token;
      const userId = pending.member.user_id;
      switch (pending.type) {
        case "remove":
          await removeWorkspaceMember(token, workspace.id, userId);
          break;
        case "role":
          await updateWorkspaceMemberRole(token, workspace.id, userId, pending.role);
          break;
        case "transfer":
          // The response carries our new role, which updates the whole app at once.
          cacheWorkspace(await transferWorkspaceOwnership(token, workspace.id, userId));
          break;
      }
    },
    onSuccess: (_result, completed) => {
      setConfirming(false);
      setSuccessMessage(describeMemberAction(completed, context).success);
    },
    // Refresh either way: after a failure the list may be out of date.
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  function requestAction(next: MemberAction) {
    actionMutation.reset();
    setSuccessMessage("");
    setAction(next);
    setConfirming(true);
  }

  const members = membersQuery.data;

  return (
    <Card>
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Members{members ? ` (${members.length})` : ""}</h2>
        <p className="mt-0.5 text-muted-foreground">
          {workspace.role === "OWNER"
            ? "You can change roles, remove members, and transfer ownership to an admin."
            : "You can change roles and remove agents and customers. Only the owner can manage admins."}
        </p>
      </div>

      {successMessage && (
        <Notice tone="success" className="m-5 mb-4">{successMessage}</Notice>
      )}

      {membersQuery.isPending ? (
        <LoadingState label="Loading members" className="p-5" />
      ) : membersQuery.isError ? (
        <ErrorState
          title="Couldn't load members"
          message={membersQuery.error.message}
          onRetry={() => void membersQuery.refetch()}
          retrying={membersQuery.isFetching}
        />
      ) : membersQuery.data.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" description="Invite someone using the form above." />
      ) : (
        <MemberList
          members={membersQuery.data}
          currentUserId={session?.user.id}
          actorRole={workspace.role}
          onAction={requestAction}
        />
      )}

      {wording && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title={wording.title}
          description={wording.description}
          confirmLabel={wording.confirmLabel}
          destructive={action?.type !== "role"}
          pending={actionMutation.isPending}
          error={actionMutation.error?.message}
          onConfirm={() => action && actionMutation.mutate(action)}
        />
      )}
    </Card>
  );
}
