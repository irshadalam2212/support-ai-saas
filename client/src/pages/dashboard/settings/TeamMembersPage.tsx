import { Lock } from "lucide-react";
import { Link } from "react-router";

import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import InviteMemberSection from "@/components/team/InviteMemberSection";
import MembersSection from "@/components/team/MembersSection";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { canManageWorkspace } from "@/lib/roles";

export default function TeamMembersPage() {
  const { activeWorkspace } = useWorkspace();

  if (!activeWorkspace) return null;

  if (!canManageWorkspace(activeWorkspace.role)) {
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

  return (
    <div className="space-y-6">
      <PageHeader title="Team members" description={`Who has access to ${activeWorkspace.name}.`} />

      {/* Both are keyed so links and messages never carry over to another workspace. */}
      <InviteMemberSection key={`invite-${activeWorkspace.id}`} workspaceId={activeWorkspace.id} />
      <MembersSection key={`members-${activeWorkspace.id}`} workspace={activeWorkspace} />
    </div>
  );
}
