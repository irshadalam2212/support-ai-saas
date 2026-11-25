import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import type { WorkspaceSummary } from "@/lib/fastapi.api";

/** Writes a created or updated workspace into the cached detail and list queries. */
export function useCacheWorkspace() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return (workspace: WorkspaceSummary) => {
    queryClient.setQueryData(["workspace-detail", workspace.id], workspace);
    if (!session) return;
    queryClient.setQueryData<WorkspaceSummary[]>(["workspaces", session.user.id], (current) => {
      if (!current) return [workspace];
      return current.some((item) => item.id === workspace.id)
        ? current.map((item) => item.id === workspace.id ? workspace : item)
        : [...current, workspace];
    });
  };
}
