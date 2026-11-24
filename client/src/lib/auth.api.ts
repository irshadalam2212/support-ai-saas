import type { LoginFormValues, SignupFormValues } from "@/schemas/auth.schema";
import { supabase } from "@/lib/supabase";
import { ensureInitialWorkspace, syncCurrentProfile } from "@/lib/fastapi.api";

export type SignupResult = {
  requiresEmailConfirmation: boolean;
};

export async function registerAccount(values: SignupFormValues): Promise<SignupResult> {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        company_name: values.companyName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;

  if (data.session) {
    await syncCurrentProfile(data.session.access_token);
    await ensureInitialWorkspace(data.session.access_token);
  }

  return { requiresEmailConfirmation: data.session === null };
}

export async function loginAccount(values: LoginFormValues): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) throw error;
  if (data.session) {
    await syncCurrentProfile(data.session.access_token);
    await ensureInitialWorkspace(data.session.access_token);
  }
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
