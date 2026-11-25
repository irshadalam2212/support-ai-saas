import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";

import PasswordField from "@/components/auth/PasswordField";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import SubmitButton from "@/components/auth/SubmitButton";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import TextField from "@/components/auth/TextField";
import Notice from "@/components/shared/Notice";
import { invitedSignupSchema, type InvitedSignupFormValues } from "@/schemas/auth.schema";

type InvitedSignupFormProps = {
  email: string;
  pending: boolean;
  error?: string;
  onSubmit: (values: InvitedSignupFormValues) => void;
};

export default function InvitedSignupForm({ email, pending, error, onSubmit }: InvitedSignupFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvitedSignupFormValues>({
    resolver: zodResolver(invitedSignupSchema),
    defaultValues: { fullName: "", password: "", terms: false },
  });
  const password = useWatch({ control, name: "password" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && <Notice tone="error">{error}</Notice>}

      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        readOnly
        icon={Mail}
        className="bg-muted text-muted-foreground"
        aria-describedby="invited-email-hint"
      />
      <p id="invited-email-hint" className="-mt-3 text-xs text-muted-foreground">
        The invitation was sent to this address.
      </p>

      <TextField
        {...register("fullName")}
        id="fullName"
        label="Full name"
        autoComplete="name"
        placeholder="Jane Doe"
        icon={User}
        error={errors.fullName?.message}
      />

      <div className="space-y-3">
        <PasswordField
          {...register("password")}
          id="password"
          label="Create a password"
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
          <TermsCheckbox checked={field.value} onCheckedChange={field.onChange} error={errors.terms?.message} />
        )}
      />

      <SubmitButton pending={pending} label="Create account and join" pendingLabel="Creating account…" />
    </form>
  );
}
