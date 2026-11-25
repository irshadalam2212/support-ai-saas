import type { WorkspaceSummary } from "@/lib/fastapi.api";

export type WorkspaceRole = WorkspaceSummary["role"];

/** Roles that can be given by invitation or role change. Ownership cannot be granted either way. */
export type AssignableRole = Exclude<WorkspaceRole, "OWNER">;

export const ASSIGNABLE_ROLES: AssignableRole[] = ["ADMIN", "AGENT", "CUSTOMER"];

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  AGENT: "Agent",
  CUSTOMER: "Customer",
};

export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  OWNER: "Full control of the workspace, its settings, and its members.",
  ADMIN: "Can edit workspace details, invite members, and manage agents and customers.",
  AGENT: "Support team access. Cannot change workspace settings or manage members.",
  CUSTOMER: "Customer access. Cannot change workspace settings or manage members.",
};

/** Mirrors the API rule for editing a workspace and managing its members. The server enforces it. */
export function canManageWorkspace(role: WorkspaceRole | undefined) {
  return role === "OWNER" || role === "ADMIN";
}

const MODIFIABLE_ROLES: Partial<Record<WorkspaceRole, WorkspaceRole[]>> = {
  OWNER: ["ADMIN", "AGENT", "CUSTOMER"],
  ADMIN: ["AGENT", "CUSTOMER"],
};

/** Only the owner may hand over ownership, and only to an admin. The server enforces it. */
export function canTransferOwnership(actorRole: WorkspaceRole, memberRole: WorkspaceRole) {
  return actorRole === "OWNER" && memberRole === "ADMIN";
}

/** Whether someone may change the role of, or remove, a member. The server enforces it. */
export function canModifyMember(actorRole: WorkspaceRole, memberRole: WorkspaceRole) {
  return MODIFIABLE_ROLES[actorRole]?.includes(memberRole) ?? false;
}
