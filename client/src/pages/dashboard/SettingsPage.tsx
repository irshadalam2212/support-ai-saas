import AccountProfileSection from "@/components/settings/AccountProfileSection";
import CreateWorkspaceSection from "@/components/settings/CreateWorkspaceSection";
import WorkspaceDetailsSection from "@/components/settings/WorkspaceDetailsSection";
import PageHeader from "@/components/shared/PageHeader";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your account and the selected workspace." />
      <AccountProfileSection />
      {/* Keyed so unsaved edits and messages never carry over to another workspace. */}
      {activeWorkspace && <WorkspaceDetailsSection key={activeWorkspace.id} workspaceId={activeWorkspace.id} />}
      <CreateWorkspaceSection />
    </div>
  );
}
