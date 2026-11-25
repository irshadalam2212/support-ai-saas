import { z } from "zod";

/** Mirrors the API's limits. Phone and company are optional and may be left empty. */
export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().max(320, "Email is too long").email("Please enter a valid email address"),
  phone: z.string().trim().max(40, "Phone number is too long"),
  company: z.string().trim().max(120, "Company name is too long"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
