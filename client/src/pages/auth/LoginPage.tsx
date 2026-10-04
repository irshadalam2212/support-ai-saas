
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
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { loginAccount, saveAuthSession } from "@/lib/auth.api";
import { getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const loginMutation = useMutation({
    mutationFn: loginAccount,
    onSuccess: (session) => {
      saveAuthSession(session, session.rememberMe);
      navigate("/dashboard", { replace: true });
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
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => loginMutation.mutateAsync(data);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute right-[-150px] top-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Logo */}
        <header className="flex justify-center px-6 py-8">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              SupportAI
            </span>
          </Link>
        </header>

        {/* Main */}
        <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:px-6">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your SupportAI account.
              </p>
            </div>

            {/* Login Card */}
            <Card className="rounded-2xl border shadow-xl shadow-black/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <LockKeyhole className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Welcome back
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Enter your credentials to continue.
                    </p>
                  </div>
                </div>
              </CardHeader>

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

                  {/* Remember Me */}
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />

                        <Label
                          htmlFor="rememberMe"
                          className="cursor-pointer text-sm font-normal text-muted-foreground"
                        >
                          Remember me
                        </Label>
                      </div>
                    )}
                  />

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
        <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
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
