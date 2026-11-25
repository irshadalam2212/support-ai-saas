import AccountMenu from "@/components/layout/AccountMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { usePageTitle } from "@/routes/usePageTitle";

type AppHeaderProps = {
  signingOut: boolean;
  onSignOut: () => void;
};

export default function AppHeader({ signingOut, onSignOut }: AppHeaderProps) {
  const { activeWorkspace } = useWorkspace();
  const title = usePageTitle();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-4">
      <SidebarTrigger className="pointer-coarse:size-11" title="Toggle navigation (Ctrl+B)" />
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 text-sm">
          {activeWorkspace && (
            <li className="hidden max-w-64 min-w-0 items-center gap-2 text-muted-foreground md:flex">
              <span className="truncate">{activeWorkspace.name}</span>
              <span aria-hidden="true">/</span>
            </li>
          )}
          <li aria-current="page" className="truncate font-medium">{title}</li>
        </ol>
      </nav>
      <AccountMenu signingOut={signingOut} onSignOut={onSignOut} />
    </header>
  );
}
