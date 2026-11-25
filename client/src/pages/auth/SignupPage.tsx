import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, User } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import SubmitButton from "@/components/auth/SubmitButton";
import TextField from "@/components/auth/TextField";
import Notice from "@/components/shared/Notice";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api";
import { registerAccount } from "@/lib/auth.api";
import { signupSchema, type SignupFormValues } from "@/schemas/auth.schema";

export default function SignupPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Set when someone arrives from a page they should go back to, such as an invitation.
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const registerMutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: ({ requiresEmailConfirmation }) => {
      if (requiresEmailConfirmation) {
        const notice = returnTo
          ? "Check your email to confirm your account, then sign in. If you were invited, open your invitation link again."
          : "Check your email to confirm your account, then sign in.";
        navigate("/login", { state: { notice, returnTo } });
        return;
      }

      navigate(returnTo ?? "/overview", { replace: true });
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      password: "",
      terms: false,
    },
  });
  const password = useWatch({ control, name: "password" });

  if (session && registerMutation.isIdle) return <Navigate to={returnTo ?? "/overview"} replace />;

  return (
    <AuthLayout title="Create your account" description="Set up your support workspace.">
      <form onSubmit={handleSubmit((values) => registerMutation.mutate(values))} className="space-y-5" noValidate>
        {registerMutation.isError && <Notice tone="error">{getApiErrorMessage(registerMutation.error)}</Notice>}

        <TextField
          {...register("fullName")}
          id="fullName"
          label="Full name"
          autoComplete="name"
          placeholder="Jane Doe"
          icon={User}
          error={errors.fullName?.message}
        />

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

        <TextField
          {...register("companyName")}
          id="companyName"
          label="Company name"
          autoComplete="organization"
          placeholder="Acme Inc"
          icon={Building2}
          error={errors.companyName?.message}
        />

        <div className="space-y-3">
          <PasswordField
            {...register("password")}
            id="password"
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            aria-describedby="password-requirements"
          />
          <PasswordRequirements id="password-requirements" password={password} />
        </div>

        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                  aria-invalid={Boolean(errors.terms)}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm leading-5 font-normal text-muted-foreground">
                  I agree to the Terms of Service and Privacy Policy.
                </Label>
              </div>
              {errors.terms && <p id="terms-error" className="mt-2 text-xs text-destructive">{errors.terms.message}</p>}
            </div>
          )}
        />

        <SubmitButton pending={registerMutation.isPending} label="Create account" pendingLabel="Creating account…" />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          state={returnTo ? { returnTo } : undefined}
          className="rounded-sm font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
