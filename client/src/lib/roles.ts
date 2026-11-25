import type { WorkspaceSummary } from "@/lib/fastapi.api";

export type WorkspaceRole = WorkspaceSummary["role"];

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  AGENT: "Agent",
  CUSTOMER: "Customer",
};

export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  OWNER: "Full control of the workspace, its settings, and its members.",
  ADMIN: "Can edit workspace details and invite members.",
  AGENT: "Support team access. Cannot change workspace settings or invite members.",
  CUSTOMER: "Customer access. Cannot change workspace settings or invite members.",
};

/** Mirrors the API rule for editing a workspace and managing its members. The server enforces it. */
export function canManageWorkspace(role: WorkspaceRole | undefined) {
  return role === "OWNER" || role === "ADMIN";
}
