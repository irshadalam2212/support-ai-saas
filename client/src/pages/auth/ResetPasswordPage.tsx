
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth.schema";
import { updatePassword } from "@/lib/auth.api";
import { getApiErrorMessage } from "@/lib/api";
import { supabase } from "@/lib/supabase";


export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);
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
        setSubmitError("");
        try {
            await updatePassword(data.password);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setSubmitError(getApiErrorMessage(error));
        }
    };

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
                                    {recoveryReady === null && (
                                        <p className="text-sm text-muted-foreground" role="status">
                                            Verifying your password recovery link…
                                        </p>
                                    )}
                                    {recoveryReady === false && (
                                        <p className="text-sm text-destructive" role="alert">
                                            {recoveryError || "This recovery link is invalid or expired."} {" "}
                                            <Link to="/forgot-password" className="font-medium underline">
                                                Request a new link
                                            </Link>
                                        </p>
                                    )}
                                    {submitError && (
                                        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                                            {submitError}
                                        </p>
                                    )}
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
                                                        disabled={recoveryReady !== true || isSubmitting}
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
                                                        disabled={recoveryReady !== true || isSubmitting}
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
                                        disabled={isSubmitting || recoveryReady !== true}
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
                <footer className="hidden">
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
