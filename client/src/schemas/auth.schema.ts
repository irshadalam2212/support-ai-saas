import { z } from "zod";

/** Shared by the password schema and the on-screen requirements checklist. */
export const passwordRules = [
  { label: "At least 8 characters", pattern: /^[\s\S]{8,}$/, message: "Password must be at least 8 characters" },
  { label: "One uppercase letter", pattern: /[A-Z]/, message: "Password must contain an uppercase letter" },
  { label: "One lowercase letter", pattern: /[a-z]/, message: "Password must contain a lowercase letter" },
  { label: "One number", pattern: /[0-9]/, message: "Password must contain a number" },
];

const newPasswordSchema = passwordRules.reduce(
  (schema, rule) => schema.regex(rule.pattern, rule.message),
  z.string(),
);

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name is too long"),

  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),

  companyName: z
    .string()
    .trim()
    .min(3, "Company name must be at least 3 characters")
    .max(100, "Company name is too long"),

  password: newPasswordSchema,

  terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and privacy policy",
  }),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

/** The email comes from the invitation, and the person is joining an existing workspace. */
export const invitedSignupSchema = signupSchema.pick({ fullName: true, password: true, terms: true });

export type InvitedSignupFormValues = z.infer<typeof invitedSignupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
