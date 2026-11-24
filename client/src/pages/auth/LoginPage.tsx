
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  // Github,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { loginAccount } from "@/lib/auth.api";
import { getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { notice?: string; returnTo?: string } | null;
  const notice = locationState?.notice;
  const loginMutation = useMutation({
    mutationFn: loginAccount,
    onSuccess: () => {
      navigate(locationState?.returnTo ?? "/dashboard", { replace: true });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => loginMutation.mutateAsync(data);

  return (
    <div className="min-h-dvh bg-background lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      {/* Background decoration */}
      <div className="hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute right-[-150px] top-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <AuthBrandPanel />
      <div className="relative flex min-h-[calc(100dvh-16rem)] flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:col-start-2 lg:h-dvh lg:min-h-0 lg:overflow-y-auto">
        {/* Main */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your SupportAI account.
              </p>
            </div>

            {/* Login Card */}
            <Card className="rounded-2xl border shadow-xl shadow-black/5">
              <CardContent className="pt-6">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {notice && (
                    <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm" role="status">
                      {notice}
                    </p>
                  )}
                  {loginMutation.isError && (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                      {getApiErrorMessage(loginMutation.error)}
                    </p>
                  )}
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Work email
                    </Label>

                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            className="h-11 rounded-lg pl-10"
                            aria-invalid={!!errors.email}
                            autoComplete="email"
                          />
                        </div>
                      )}
                    />

                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">
                        Password
                      </Label>

                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            {...field}
                            id="password"
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            placeholder="••••••••••••"
                            className="h-11 rounded-lg pl-10 pr-10"
                            aria-invalid={!!errors.password}
                            autoComplete="current-password"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (value) => !value
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    />

                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || loginMutation.isPending}
                    className="h-11 w-full rounded-lg"
                  >
                    {isSubmitting || loginMutation.isPending
                      ? "Signing in..."
                      : "Sign in"}

                    {!isSubmitting && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-lg"
                  >
                    <GoogleIcon />
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-lg"
                  >
                    {/* <Github className="mr-2 h-4 w-4" /> */}
                    GitHub
                  </Button>
                </div>

                {/* Signup */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Security */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" />

              <span>
                Your data is encrypted and securely stored.
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="hidden">
          © 2026 SupportAI. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Google Icon                                                                */
/* -------------------------------------------------------------------------- */

function GoogleIcon() {
  return (
    <svg
      className="mr-2 h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.26Z"
      />

      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.68a5.85 5.85 0 0 1 0-3.36V7.79H3.3a9.8 9.8 0 0 0 0 8.42l3.24-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.01 9.46 6.29 12 6.29Z"
      />
    </svg>
  );
}
