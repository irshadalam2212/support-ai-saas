import { useNavigate } from "react-router";

import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OverviewPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const navigate = useNavigate();

  if (!activeWorkspace) {
    return (
      <Card className="mx-auto max-w-xl space-y-3 p-6">
        <h1 className="text-xl font-semibold">Set up your workspace</h1>
        <p className="text-sm text-muted-foreground">
          Create a workspace to manage its details, members, and invitations.
        </p>
        <Button onClick={() => navigate("/dashboard/settings")}>Open workspace settings</Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace and team. Support ticket and AI features will appear here as they are implemented.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Active workspace</p>
          <p className="mt-2 truncate text-xl font-semibold">{activeWorkspace.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{activeWorkspace.slug}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Your workspace access</p>
          <p className="mt-2 text-xl font-semibold">{activeWorkspace.role}</p>
          <p className="mt-1 text-sm text-muted-foreground">{workspaces.length} workspace{workspaces.length === 1 ? "" : "s"} available to you</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold">Workspace management is ready</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Edit workspace details, create another workspace, view members, and invite teammates. The remaining support and AI sections are marked as planned until their APIs are connected.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => navigate("/dashboard/settings")}>Workspace settings</Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/settings/team")}>Team members</Button>
        </div>
      </Card>
    </div>
  );
}
