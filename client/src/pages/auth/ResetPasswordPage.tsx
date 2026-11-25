import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";

import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import SubmitButton from "@/components/auth/SubmitButton";
import Notice from "@/components/shared/Notice";
import { getApiErrorMessage } from "@/lib/api";
import { updatePassword } from "@/lib/auth.api";
import { supabase } from "@/lib/supabase";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth.schema";

export default function ResetPasswordPage() {
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(null);
  const [recoveryError, setRecoveryError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setRecoveryReady(true);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setRecoveryError(getApiErrorMessage(error));
        setRecoveryReady(false);
        return;
      }
      setRecoveryReady(data.session !== null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });
  const fieldsDisabled = recoveryReady !== true || isSubmitting;

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setSubmitError("");
    try {
      await updatePassword(data.password);
      navigate("/overview", { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  return (
    <AuthLayout title="Create a new password" description="Choose a strong password for your SupportAI account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {recoveryReady === null && <Notice tone="info">Verifying your password recovery link…</Notice>}
        {recoveryReady === false && (
          <Notice tone="error">
            {recoveryError || "This recovery link is invalid or expired."}{" "}
            <Link to="/forgot-password" className="font-medium underline">Request a new link</Link>
          </Notice>
        )}
        {submitError && <Notice tone="error">{submitError}</Notice>}

        <div className="space-y-3">
          <PasswordField
            {...register("password")}
            id="password"
            label="New password"
            autoComplete="new-password"
            error={errors.password?.message}
            aria-describedby="password-requirements"
            disabled={fieldsDisabled}
          />
          <PasswordRequirements id="password-requirements" password={password} />
        </div>

        <PasswordField
          {...register("confirmPassword")}
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={fieldsDisabled}
        />

        <SubmitButton
          pending={isSubmitting}
          disabled={recoveryReady !== true}
          label="Reset password"
          pendingLabel="Resetting password…"
        />
      </form>

      <p className="mt-6 text-center">
        <Link to="/login" className="rounded-sm text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
