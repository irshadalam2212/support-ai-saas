import { useQuery } from "@tanstack/react-query";
import { Lock, Users } from "lucide-react";
import { Link } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import PageHeader from "@/components/shared/PageHeader";
import InviteMemberSection from "@/components/team/InviteMemberSection";
import MemberList from "@/components/team/MemberList";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { getWorkspaceMembers } from "@/lib/fastapi.api";
import { canManageWorkspace } from "@/lib/roles";

export default function TeamMembersPage() {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const canManage = canManageWorkspace(activeWorkspace?.role);

  const membersQuery = useQuery({
    queryKey: ["workspace-members", activeWorkspace?.id],
    queryFn: () => getWorkspaceMembers(session!.access_token, activeWorkspace!.id),
    enabled: Boolean(session?.access_token && activeWorkspace?.id && canManage),
  });

  if (!activeWorkspace) return null;

  if (!canManage) {
    return (
      <Card className="mx-auto max-w-xl">
        <EmptyState
          headingLevel="h1"
          icon={Lock}
          title="Team members"
          description="Only workspace owners and admins can view the member list or invite people."
          action={<Link to="/overview" className={buttonVariants({ variant: "outline" })}>Back to overview</Link>}
        />
      </Card>
    );
  }

  const members = membersQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Team members" description={`Who has access to ${activeWorkspace.name}.`} />

      {/* Keyed so an invitation link never stays on screen after switching workspace. */}
      <InviteMemberSection key={activeWorkspace.id} workspaceId={activeWorkspace.id} />

      <Card>
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Members{members ? ` (${members.length})` : ""}</h2>
          <p className="mt-0.5 text-muted-foreground">Changing roles and removing members isn't available yet.</p>
        </div>
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
          <MemberList members={membersQuery.data} currentUserId={session?.user.id} />
        )}
      </Card>
    </div>
  );
}
