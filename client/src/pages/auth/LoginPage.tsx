import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import SubmitButton from "@/components/auth/SubmitButton";
import TextField from "@/components/auth/TextField";
import Notice from "@/components/shared/Notice";
import { getApiErrorMessage } from "@/lib/api";
import { loginAccount } from "@/lib/auth.api";
import { isInvitationPath } from "@/lib/invitations";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

export default function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { notice?: string; returnTo?: string; email?: string } | null;
  const notice = locationState?.notice;
  const returnTo = locationState?.returnTo;
  const answeringInvitation = isInvitationPath(returnTo);
  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => loginAccount(values, { answeringInvitation }),
    onSuccess: (unansweredInvitation) => {
      navigate(returnTo ?? unansweredInvitation ?? "/overview", { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: locationState?.email ?? "", password: "" },
  });

  // Only for people who arrive already signed in. While a sign-in is running,
  // the mutation decides when to move on (after the profile has synchronized).
  if (session && loginMutation.isIdle) return <Navigate to={returnTo ?? "/overview"} replace />;

  return (
    <AuthLayout title="Welcome back" description="Sign in to your SupportAI account.">
      <form onSubmit={handleSubmit((values) => loginMutation.mutate(values))} className="space-y-5" noValidate>
        {notice && <Notice tone="info">{notice}</Notice>}
        {loginMutation.isError && <Notice tone="error">{getApiErrorMessage(loginMutation.error)}</Notice>}

        <TextField
          {...register("email")}
          id="email"
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email?.message}
        />

        <PasswordField
          {...register("password")}
          id="password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          labelAction={
            <Link to="/forgot-password" className="rounded-sm text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          }
        />

        <SubmitButton pending={loginMutation.isPending} label="Sign in" pendingLabel="Signing in…" />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        {/* Invited people create their account on the invitation page. */}
        <Link
          to={answeringInvitation ? returnTo! : "/signup"}
          state={returnTo && !answeringInvitation ? { returnTo } : undefined}
          className="rounded-sm font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
