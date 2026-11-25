import { ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { getInitials } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  // Loading and error feedback is shown in the main content area.
  if (!activeWorkspace) return <Skeleton aria-hidden="true" className="h-12 group-data-[collapsible=icon]:size-8" />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="border border-sidebar-border bg-background group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 pointer-coarse:group-data-[collapsible=icon]:size-11!"
              />
            }
            aria-label={`Switch workspace. Current workspace: ${activeWorkspace.name}`}
            title={activeWorkspace.name}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
              {getInitials(activeWorkspace.name)}
            </span>
            <span className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="block truncate font-medium">{activeWorkspace.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{ROLE_LABELS[activeWorkspace.role]}</span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2">Workspaces</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={activeWorkspace.id}
                onValueChange={(value: string) => {
                  setActiveWorkspaceId(value);
                  setOpenMobile(false);
                }}
              >
                {workspaces.map((workspace) => (
                  <DropdownMenuRadioItem key={workspace.id} value={workspace.id} closeOnClick className="px-2 py-2">
                    <span className="min-w-0">
                      <span className="block truncate">{workspace.name}</span>
                      <span className="block text-xs text-muted-foreground">{ROLE_LABELS[workspace.role]}</span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 px-2 py-2 pointer-coarse:py-3"
              onClick={() => {
                setOpenMobile(false);
                navigate("/settings#create-workspace");
              }}
            >
              <Plus aria-hidden="true" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
