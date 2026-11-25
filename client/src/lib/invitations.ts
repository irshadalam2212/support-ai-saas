import type { User } from "@supabase/supabase-js";

import { respondToWorkspaceInvitation, syncCurrentProfile, type InvitationDecision } from "@/lib/fastapi.api";
import { supabase } from "@/lib/supabase";

const INVITATION_PATH = "/invitations/respond";
const ACTIVE_WORKSPACE_KEY = "supportai.activeWorkspaceId";

export function invitationPath(token: string) {
  return `${INVITATION_PATH}?token=${encodeURIComponent(token)}`;
}

export function isInvitationPath(path: string | undefined) {
  return path?.startsWith(`${INVITATION_PATH}?`) ?? false;
}

/**
 * The invitation someone created their account from and has not answered yet.
 * It is kept on the Supabase user so that it survives email confirmation, even on another device.
 */
export function pendingInvitationToken(user: User | null | undefined): string | null {
  const token: unknown = user?.user_metadata?.invitation_token;
  return typeof token === "string" && token !== "" ? token : null;
}

/** Forgets the stored invitation. Failure is harmless: an answered invitation cannot be reused. */
export async function clearPendingInvitation() {
  await supabase.auth.updateUser({ data: { invitation_token: null } }).catch(() => undefined);
}

/** Accepts or declines, and opens the joined workspace next time the app is shown. */
export async function answerInvitation(
  accessToken: string,
  user: User,
  decision: "accept" | "decline",
  token: string,
): Promise<InvitationDecision> {
  // Accepting requires a profile, which a brand-new account may not have yet.
  await syncCurrentProfile(accessToken);
  const result = await respondToWorkspaceInvitation(accessToken, decision, token);
  if (result.status === "ACCEPTED") localStorage.setItem(ACTIVE_WORKSPACE_KEY, result.workspace_id);
  if (pendingInvitationToken(user) === token) await clearPendingInvitation();
  return result;
}
