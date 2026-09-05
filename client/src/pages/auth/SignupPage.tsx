import { useState } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
//   Github,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
  Building2,
  ArrowRight,
  Check,
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
import { signupSchema, type SignupFormValues } from "@/schemas/auth.schema";


export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  const onSubmit = async (data: SignupFormValues) => {
    console.log("Signup data:", data);

    // API integration will be added later.
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute right-[-150px] top-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Page */}
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
                Create your account
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Start building your AI-powered support team.
              </p>
            </div>

            {/* Signup card */}
            <Card className="rounded-2xl border shadow-xl shadow-black/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Start your 14-day free trial
                    </p>

                    <p className="text-xs text-muted-foreground">
                      No credit card required
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Full name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full name
                    </Label>

                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            {...field}
                            id="fullName"
                            placeholder="John Doe"
                            className="h-11 rounded-lg pl-10"
                            aria-invalid={!!errors.fullName}
                          />
                        </div>
                      )}
                    />

                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

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

                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company name
                    </Label>

                    <Controller
                      name="companyName"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            {...field}
                            id="companyName"
                            placeholder="Acme Inc"
                            className="h-11 rounded-lg pl-10"
                            aria-invalid={!!errors.companyName}
                          />
                        </div>
                      )}
                    />

                    {errors.companyName && (
                      <p className="text-xs text-destructive">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password
                    </Label>

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

                    {/* Password requirements */}
                    <div className="grid grid-cols-1 gap-1 pt-1 sm:grid-cols-2">
                      <PasswordRequirement text="At least 8 characters" />

                      <PasswordRequirement text="One uppercase letter" />

                      <PasswordRequirement text="One lowercase letter" />

                      <PasswordRequirement text="One number" />
                    </div>
                  </div>

                  {/* Terms */}
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
                          />

                          <Label
                            htmlFor="terms"
                            className="cursor-pointer text-sm font-normal leading-5 text-muted-foreground"
                          >
                            I agree to the{" "}
                            <Link
                              to="/terms"
                              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              to="/privacy"
                              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                            >
                              Privacy Policy
                            </Link>
                            .
                          </Label>
                        </div>

                        {errors.terms && (
                          <p className="mt-2 text-xs text-destructive">
                            {errors.terms.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg"
                  >
                    {isSubmitting
                      ? "Creating account..."
                      : "Create account"}

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

                {/* Social auth */}
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

                {/* Login */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5" />
              Your data is encrypted and securely stored.
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
/* Password Requirement                                                       */
/* -------------------------------------------------------------------------- */

function PasswordRequirement({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="h-3 w-3 text-primary" />
      {text}
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