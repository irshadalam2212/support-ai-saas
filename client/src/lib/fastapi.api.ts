import { z } from "zod";

const API_BASE_URL = (
  import.meta.env.VITE_FASTAPI_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("supportai-api"),
});

const profileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

const workspaceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  role: z.enum(["OWNER", "ADMIN", "AGENT", "CUSTOMER"]),
  created_at: z.string().datetime({ offset: true }),
});

export type FastApiHealth = z.infer<typeof healthResponseSchema>;
export type CurrentProfile = z.infer<typeof profileResponseSchema>;
export type WorkspaceSummary = z.infer<typeof workspaceResponseSchema>;

async function workspaceRequest(path: string, accessToken: string, method: "GET" | "POST") {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    throw new Error("Could not reach SupportAI to load your workspace. Please try again.", { cause: error });
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = z.object({ detail: z.string().optional() }).safeParse(result);
    throw new Error(detail.success && detail.data.detail
      ? detail.data.detail
      : `Workspace request failed (HTTP ${response.status}).`);
  }
  return result;
}

export async function getWorkspaces(accessToken: string): Promise<WorkspaceSummary[]> {
  const result = await workspaceRequest("/workspaces", accessToken, "GET");
  const parsed = z.array(workspaceResponseSchema).safeParse(result);
  if (!parsed.success) throw new Error("FastAPI returned an unexpected workspace list.");
  return parsed.data;
}

export async function ensureInitialWorkspace(accessToken: string): Promise<WorkspaceSummary> {
  const result = await workspaceRequest("/workspaces/onboarding", accessToken, "POST");
  const parsed = workspaceResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("FastAPI returned an unexpected workspace response.");
  return parsed.data;
}

export async function syncCurrentProfile(accessToken: string): Promise<CurrentProfile> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    throw new Error("Your account is ready, but profile setup could not reach SupportAI. Please try again.", { cause: error });
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = z.object({ detail: z.string().optional() }).safeParse(result);
    throw new Error(detail.success && detail.data.detail
      ? `Your account is ready, but profile setup failed: ${detail.data.detail}`
      : `Your account is ready, but profile setup failed (HTTP ${response.status}).`);
  }

  const parsed = profileResponseSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("Your account is ready, but FastAPI returned an unexpected profile response.");
  }
  return parsed.data;
}

export async function getFastApiHealth(signal?: AbortSignal): Promise<FastApiHealth> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new Error(
      `Could not reach FastAPI at ${API_BASE_URL}. Make sure it is running and allows requests from this frontend.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(`FastAPI health check returned HTTP ${response.status}.`);
  }

  const result: unknown = await response.json();
  const parsed = healthResponseSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("FastAPI returned an unexpected health response.");
  }

  return parsed.data;
}

export function getFastApiBaseUrl(): string {
  return API_BASE_URL;
}
