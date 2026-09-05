
import { useState } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth.schema";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    console.log("Send reset link:", data);

    // API integration will be added later.

    // Example:
    // await forgotPassword(data.email);

    setEmailSent(true);
  };

  if (emailSent) {
    return <ResetLinkSent email={""} />;
  }

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
                <Mail className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Forgot your password?
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                No worries. Enter the email address associated with
                your account and we'll send you a password reset link.
              </p>
            </div>

            {/* Card */}
            <Card className="rounded-2xl border shadow-xl shadow-black/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Password recovery
                    </p>

                    <p className="text-xs text-muted-foreground">
                      We'll email you a secure reset link.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
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
                            autoFocus
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

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg"
                  >
                    {isSubmitting
                      ? "Sending reset link..."
                      : "Send reset link"}

                    {!isSubmitting && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </form>

                {/* Back */}
                <div className="mt-6 flex justify-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              For security reasons, we don't reveal whether an email
              address is registered with SupportAI.
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
/* Reset Link Sent                                                            */
/* -------------------------------------------------------------------------- */

function ResetLinkSent({ email }: { email: string }) {
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
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Check your email
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                We've sent a password reset link to{" "}
                {email || "your email address"}.
              </p>
            </div>

            <Card className="rounded-2xl border shadow-xl shadow-black/5">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>

                  <h2 className="mt-5 text-base font-semibold">
                    Reset link sent
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Open the email and click the reset link to create
                    a new password.
                  </p>

                  <div className="mt-6 w-full rounded-xl border bg-muted/20 p-4 text-left">
                    <p className="text-xs font-medium">
                      Didn't receive the email?
                    </p>

                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• Check your spam or junk folder.</li>
                      <li>• Make sure your email address is correct.</li>
                      <li>• Wait a few minutes and try again.</li>
                    </ul>
                  </div>

                  <Link
                    to="/login"
                    className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
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