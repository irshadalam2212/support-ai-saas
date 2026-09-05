
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
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
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth.schema";


export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        console.log("Reset password:", {
            token,
            password: data.password,
        });

        // API integration will be added later.

        // Example after successful API response:
        // navigate("/login");
    };

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
                                <LockKeyhole className="h-5 w-5 text-primary" />
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Create a new password
                            </h1>

                            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                                Choose a strong password to secure your SupportAI
                                account.
                            </p>
                        </div>

                        {/* Card */}
                        <Card className="rounded-2xl border shadow-xl shadow-black/5">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <LockKeyhole className="h-4 w-4 text-primary" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            Reset your password
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Enter your new password below.
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-5"
                                >
                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            New password
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
                                                        autoComplete="new-password"
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

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">
                                            Confirm password
                                        </Label>

                                        <Controller
                                            name="confirmPassword"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="relative">
                                                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                                    <Input
                                                        {...field}
                                                        id="confirmPassword"
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="••••••••••••"
                                                        className="h-11 rounded-lg pl-10 pr-10"
                                                        aria-invalid={
                                                            !!errors.confirmPassword
                                                        }
                                                        autoComplete="new-password"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                (value) => !value
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                                        aria-label={
                                                            showConfirmPassword
                                                                ? "Hide password"
                                                                : "Show password"
                                                        }
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        />

                                        {errors.confirmPassword && (
                                            <p className="text-xs text-destructive">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password requirements */}
                                    <div className="rounded-xl border bg-muted/20 p-4">
                                        <p className="mb-3 text-xs font-medium">
                                            Password requirements
                                        </p>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <PasswordRequirement text="At least 8 characters" />
                                            <PasswordRequirement text="One uppercase letter" />
                                            <PasswordRequirement text="One lowercase letter" />
                                            <PasswordRequirement text="One number" />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-11 w-full rounded-lg"
                                    >
                                        {isSubmitting
                                            ? "Resetting password..."
                                            : "Reset password"}

                                        {!isSubmitting && (
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                </form>

                                {/* Back to Login */}
                                <div className="mt-6 text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Back to sign in
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security note */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <LockKeyhole className="h-3.5 w-3.5" />

                            <span>
                                Your new password will be securely encrypted.
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
