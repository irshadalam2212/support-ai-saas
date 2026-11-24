import { createContext, useContext } from "react";

import type { WorkspaceSummary } from "@/lib/fastapi.api";

export type WorkspaceContextValue = {
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  setActiveWorkspaceId: (workspaceId: string) => void;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside OrganizationLayout.");
  return context;
}
