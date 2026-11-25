import type { WorkspaceMemberSummary } from "@/lib/fastapi.api";
import { getMemberName } from "@/lib/format";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type AssignableRole, type WorkspaceRole } from "@/lib/roles";

/** A change to a member that is waiting for confirmation. */
export type MemberAction =
  | { type: "role"; member: WorkspaceMemberSummary; role: AssignableRole }
  | { type: "remove"; member: WorkspaceMemberSummary }
  | { type: "transfer"; member: WorkspaceMemberSummary };

type ActionContext = { workspaceName: string; actorRole: WorkspaceRole };

/** The wording shown before and after an action. */
export function describeMemberAction(action: MemberAction, { workspaceName, actorRole }: ActionContext) {
  const name = getMemberName(action.member);

  if (action.type === "remove") {
    return {
      title: `Remove ${name}?`,
      description: `${name} will immediately lose access to ${workspaceName}. Pending invitations sent by them or to them will be revoked.`,
      confirmLabel: "Remove member",
      success: `${name} was removed from the workspace.`,
    };
  }

  if (action.type === "transfer") {
    return {
      title: `Make ${name} the owner?`,
      description: `${name} will become the owner of ${workspaceName}, and you will become an admin. Only the new owner can transfer ownership back.`,
      confirmLabel: "Transfer ownership",
      success: `${name} is now the owner. You are an admin.`,
    };
  }

  const label = ROLE_LABELS[action.role];
  const notes = [`${label}: ${ROLE_DESCRIPTIONS[action.role]}`];
  if (action.member.role === "ADMIN" && action.role !== "ADMIN") {
    notes.push("Pending invitations they sent will be revoked.");
  }
  if (action.role === "ADMIN" && actorRole === "ADMIN") {
    notes.push("Afterwards, only the owner will be able to change or remove them.");
  }

  return {
    title: `Change ${name}'s role to ${label}?`,
    description: notes.join(" "),
    confirmLabel: "Change role",
    success: `${name}'s role is now ${label}.`,
  };
}
