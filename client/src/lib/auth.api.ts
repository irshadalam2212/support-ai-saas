import type { InvitedSignupFormValues, LoginFormValues, SignupFormValues } from "@/schemas/auth.schema";
import { supabase } from "@/lib/supabase";
import { ensureInitialWorkspace, syncCurrentProfile } from "@/lib/fastapi.api";
import { answerInvitation, invitationPath, pendingInvitationToken } from "@/lib/invitations";

export type SignupResult = {
  requiresEmailConfirmation: boolean;
};

const emailRedirectTo = () => `${window.location.origin}/auth/callback`;

export async function registerAccount(values: SignupFormValues): Promise<SignupResult> {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        company_name: values.companyName,
      },
      emailRedirectTo: emailRedirectTo(),
    },
  });

  if (error) throw error;

  if (data.session) {
    await syncCurrentProfile(data.session.access_token);
    await ensureInitialWorkspace(data.session.access_token);
  }

  return { requiresEmailConfirmation: data.session === null };
}

/**
 * Creates an account for an invited person and joins them to the workspace.
 * No workspace of their own is created.
 */
export async function registerInvitedAccount(
  values: InvitedSignupFormValues & { email: string; invitationToken: string },
): Promise<SignupResult> {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { full_name: values.fullName, invitation_token: values.invitationToken },
      emailRedirectTo: emailRedirectTo(),
    },
  });

  if (error) throw error;

  if (!data.session) {
    // With email confirmation on, Supabase hides an existing account behind a user with no identities.
    if (data.user?.identities?.length === 0) {
      throw new Error("An account with this email already exists. Sign in instead.");
    }
    return { requiresEmailConfirmation: true };
  }

  await answerInvitation(data.session.access_token, data.session.user, "accept", values.invitationToken);
  return { requiresEmailConfirmation: false };
}

/** Returns the path of an unanswered invitation the account was created from, if any. */
export async function loginAccount(
  values: LoginFormValues,
  { answeringInvitation = false } = {},
): Promise<string | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) throw error;
  if (!data.session) return null;

  const token = pendingInvitationToken(data.session.user);
  await syncCurrentProfile(data.session.access_token);
  // Someone on the way to an invitation should not be given a workspace of their own first.
  if (!answeringInvitation && !token) await ensureInitialWorkspace(data.session.access_token);
  return token ? invitationPath(token) : null;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
}
