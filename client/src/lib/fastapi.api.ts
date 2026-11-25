import { z } from "zod";

import { ApiError, getErrorDetail } from "@/lib/api";

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

const currentUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
});

const workspaceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  role: z.enum(["OWNER", "ADMIN", "AGENT", "CUSTOMER"]),
  created_at: z.string().datetime({ offset: true }),
});

const workspaceMemberSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  role: z.enum(["OWNER", "ADMIN", "AGENT", "CUSTOMER"]),
  joined_at: z.string().datetime({ offset: true }),
});

const workspaceInvitationSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "AGENT", "CUSTOMER"]),
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "REVOKED", "EXPIRED"]),
  expires_at: z.string().datetime({ offset: true }),
  created_at: z.string().datetime({ offset: true }),
  invitation_url: z.string().url(),
  email_sent: z.boolean(),
});

const invitationPreviewSchema = z.object({
  workspace_name: z.string(),
  email: z.string(),
  role: z.enum(["ADMIN", "AGENT", "CUSTOMER"]),
  expires_at: z.string().datetime({ offset: true }),
});

const invitationDecisionSchema = z.object({
  invitation_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  role: z.enum(["ADMIN", "AGENT", "CUSTOMER"]),
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export type FastApiHealth = z.infer<typeof healthResponseSchema>;
export type CurrentProfile = z.infer<typeof profileResponseSchema>;
export type CurrentUser = z.infer<typeof currentUserResponseSchema>;
export type WorkspaceSummary = z.infer<typeof workspaceResponseSchema>;
export type WorkspaceMemberSummary = z.infer<typeof workspaceMemberSchema>;
export type WorkspaceInvitation = z.infer<typeof workspaceInvitationSchema>;
export type InvitationDecision = z.infer<typeof invitationDecisionSchema>;
export type InvitationPreview = z.infer<typeof invitationPreviewSchema>;

async function workspaceRequest(
  path: string,
  /** Null only for endpoints that are public. */
  accessToken: string | null,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(accessToken === null ? {} : { Authorization: `Bearer ${accessToken}` }),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new Error("Could not reach SupportAI. Check your connection and try again.", { cause: error });
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      getErrorDetail(result) ?? `Workspace request failed (HTTP ${response.status}).`,
      response.status,
    );
  }
  return result;
}

export async function getWorkspaces(accessToken: string): Promise<WorkspaceSummary[]> {
  const result = await workspaceRequest("/workspaces", accessToken, "GET");
  const parsed = z.array(workspaceResponseSchema).safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace list.");
  return parsed.data;
}

export async function ensureInitialWorkspace(accessToken: string): Promise<WorkspaceSummary> {
  const result = await workspaceRequest("/workspaces/onboarding", accessToken, "POST");
  const parsed = workspaceResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace response.");
  return parsed.data;
}

export async function getWorkspace(accessToken: string, workspaceId: string): Promise<WorkspaceSummary> {
  const result = await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}`,
    accessToken,
    "GET",
  );
  const parsed = workspaceResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace response.");
  return parsed.data;
}

export async function createWorkspace(
  accessToken: string,
  name: string,
  description: string,
): Promise<WorkspaceSummary> {
  const result = await workspaceRequest("/workspaces", accessToken, "POST", {
    name,
    description: description.trim() || null,
  });
  const parsed = workspaceResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace response.");
  return parsed.data;
}

export async function updateWorkspace(
  accessToken: string,
  workspaceId: string,
  updates: { name?: string; description?: string | null },
): Promise<WorkspaceSummary> {
  const result = await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}`,
    accessToken,
    "PATCH",
    updates,
  );
  const parsed = workspaceResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace response.");
  return parsed.data;
}

export async function getWorkspaceMembers(
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceMemberSummary[]> {
  const result = await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}/members`,
    accessToken,
    "GET",
  );
  const parsed = z.array(workspaceMemberSchema).safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace member list.");
  return parsed.data;
}

export async function updateWorkspaceMemberRole(
  accessToken: string,
  workspaceId: string,
  userId: string,
  role: "ADMIN" | "AGENT" | "CUSTOMER",
): Promise<WorkspaceMemberSummary> {
  const result = await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`,
    accessToken,
    "PATCH",
    { role },
  );
  const parsed = workspaceMemberSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace member response.");
  return parsed.data;
}

export async function removeWorkspaceMember(
  accessToken: string,
  workspaceId: string,
  userId: string,
): Promise<void> {
  await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`,
    accessToken,
    "DELETE",
  );
}

/** Makes an admin the owner. Returns the workspace with the caller's new role. */
export async function transferWorkspaceOwnership(
  accessToken: string,
  workspaceId: string,
  userId: string,
): Promise<WorkspaceSummary> {
  const result = await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}/transfer-ownership`,
    accessToken,
    "POST",
  );
  const parsed = workspaceResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected workspace response.");
  return parsed.data;
}

export async function createWorkspaceInvitation(
  accessToken: string,
  workspaceId: string,
  email: string,
  role: "ADMIN" | "AGENT" | "CUSTOMER",
): Promise<WorkspaceInvitation> {
  const result = await workspaceRequest(
    `/workspaces/${encodeURIComponent(workspaceId)}/members/invitations`,
    accessToken,
    "POST",
    { email, role },
  );
  const parsed = workspaceInvitationSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected invitation response.");
  return parsed.data;
}

/** Public: the invitation token is the only credential needed. */
export async function previewWorkspaceInvitation(invitationToken: string): Promise<InvitationPreview> {
  const result = await workspaceRequest("/invitations/preview", null, "POST", {
    invitation_token: invitationToken,
  });
  const parsed = invitationPreviewSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected invitation preview.");
  return parsed.data;
}

export async function respondToWorkspaceInvitation(
  accessToken: string,
  decision: "accept" | "decline",
  invitationToken: string,
): Promise<InvitationDecision> {
  const result = await workspaceRequest(
    `/invitations/${decision}`,
    accessToken,
    "POST",
    { invitation_token: invitationToken },
  );
  const parsed = invitationDecisionSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected invitation decision response.");
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
    const detail = getErrorDetail(result);
    throw new ApiError(
      detail
        ? `Your account is ready, but profile setup failed: ${detail}`
        : `Your account is ready, but profile setup failed (HTTP ${response.status}).`,
      response.status,
    );
  }

  const parsed = profileResponseSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("Your account is ready, but SupportAI returned an unexpected profile response.");
  }
  return parsed.data;
}

export async function getCurrentProfile(accessToken: string): Promise<CurrentProfile> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw new Error("Could not reach SupportAI to load your profile.", { cause: error });
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      getErrorDetail(result) ?? `Profile request failed (HTTP ${response.status}).`,
      response.status,
    );
  }
  const parsed = profileResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected profile response.");
  return parsed.data;
}

export async function getAuthenticatedUser(accessToken: string): Promise<CurrentUser> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw new Error("Could not reach SupportAI to verify the current account.", { cause: error });
  }
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      getErrorDetail(result) ?? `Account request failed (HTTP ${response.status}).`,
      response.status,
    );
  }
  const parsed = currentUserResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected account response.");
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
