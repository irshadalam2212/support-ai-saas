import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router";

import AuthLayout from "@/components/auth/AuthLayout";
import SubmitButton from "@/components/auth/SubmitButton";
import TextField from "@/components/auth/TextField";
import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";
import { requestPasswordReset } from "@/lib/auth.api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth.schema";

function BackToSignIn() {
  return (
    <p className="mt-6 flex justify-center">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to sign in
      </Link>
    </p>
  );
}

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setErrorMessage("");
    try {
      await requestPasswordReset(data.email);
      setSubmittedEmail(data.email);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  if (submittedEmail) {
    return (
      <AuthLayout
        title="Check your email"
        description={`If an account exists for ${submittedEmail}, a password reset link is on its way.`}
      >
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Didn't receive the email?</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            <li>Check your spam or junk folder.</li>
            <li>Make sure the email address is correct.</li>
            <li>Wait a few minutes and try again.</li>
          </ul>
        </div>
        <Button type="button" variant="outline" className="mt-4 h-11 w-full" onClick={() => setSubmittedEmail("")}>
          Use a different email
        </Button>
        <BackToSignIn />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your account email and we'll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errorMessage && <Notice tone="error">{errorMessage}</Notice>}

        <TextField
          {...register("email")}
          id="email"
          label="Work email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email?.message}
        />

        <SubmitButton pending={isSubmitting} label="Send reset link" pendingLabel="Sending reset link…" />
      </form>
      <BackToSignIn />
      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        For security, we don't reveal whether an email address is registered.
      </p>
    </AuthLayout>
  );
}
