const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1")
  .replace(/\/$/, "");

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  const result = await response.json().catch(() => null) as ApiResponse<T> | { message?: string } | null;
  if (!response.ok) {
    throw new ApiError(result?.message || "The request failed. Please try again.", response.status);
  }
  return result as ApiResponse<T>;
}

export function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
