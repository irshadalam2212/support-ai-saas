import { NavLink, Outlet } from "react-router";

import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { canManageWorkspace } from "@/lib/roles";
import { cn } from "@/lib/utils";

const sections = [
  { label: "General", path: "/settings" },
  { label: "Team members", path: "/settings/team" },
  { label: "AI assistant", path: "/settings/assistant", comingSoon: true },
  { label: "Integrations", path: "/settings/integrations", comingSoon: true },
  { label: "Security", path: "/settings/security", comingSoon: true },
];

export default function SettingsLayout() {
  const { activeWorkspace } = useWorkspace();
  // Only "General" applies to people who cannot manage the workspace.
  const showSections = canManageWorkspace(activeWorkspace?.role);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {showSections && (
        <nav aria-label="Settings sections" className="flex flex-wrap gap-1 border-b pb-2">
          {sections.map(({ label, path, comingSoon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors pointer-coarse:h-11",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {label}
              {comingSoon && <span className="text-xs font-normal text-muted-foreground">Soon</span>}
            </NavLink>
          ))}
        </nav>
      )}
      <Outlet />
    </div>
  );
}
