import { Link, useLocation } from "react-router";

import { getNavigation } from "@/components/layout/navigation";
import WorkspaceSwitcher from "@/components/layout/WorkspaceSwitcher";
import Logo from "@/components/shared/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";

export default function AppSidebar() {
  const { activeWorkspace } = useWorkspace();
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 border-b border-sidebar-border">
        <Link
          to="/overview"
          aria-label="SupportAI overview"
          onClick={() => setOpenMobile(false)}
          className="flex h-10 items-center overflow-hidden rounded-md group-data-[collapsible=icon]:justify-center"
        >
          <Logo textClassName="group-data-[collapsible=icon]:hidden" />
        </Link>
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Main navigation">
          {getNavigation(activeWorkspace?.role).map((group) => (
            <SidebarGroup key={group.label}>
              {/* The faded label overlaps the item above when collapsed, so it must not catch clicks. */}
              <SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map(({ label, path, icon: Icon, isActive }) => {
                    const active = isActive(pathname);
                    return (
                      <SidebarMenuItem key={path}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={label}
                          className="h-9 pointer-coarse:h-11 pointer-coarse:group-data-[collapsible=icon]:size-11! pointer-coarse:group-data-[collapsible=icon]:p-3.5! data-active:bg-primary/10 data-active:text-primary data-active:hover:bg-primary/10 data-active:hover:text-primary"
                          render={
                            <Link
                              to={path}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setOpenMobile(false)}
                            />
                          }
                        >
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
