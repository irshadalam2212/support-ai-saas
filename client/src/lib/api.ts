import { z } from "zod";

/** An error response from the SupportAI API. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const errorBodySchema = z.object({
  detail: z.union([z.string(), z.array(z.object({ msg: z.string() })).min(1)]),
});

/** Reads FastAPI's `detail`: a string, or a list for validation (422) errors. */
export function getErrorDetail(body: unknown): string | null {
  const parsed = errorBodySchema.safeParse(body);
  if (!parsed.success) return null;
  const { detail } = parsed.data;
  if (typeof detail === "string") return detail || null;
  return detail.map((item) => item.msg.replace(/^Value error, /, "")).join(". ");
}

export function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
