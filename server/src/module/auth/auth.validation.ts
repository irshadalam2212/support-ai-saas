import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be atleast 3 characters.")
        .max(100, "Name is too long."),
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .transform((value) => value.toLowerCase()),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
})

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .transform((value) => value.toLowerCase()),

    password: z
        .string()
        .min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<
  typeof refreshTokenSchema
>;