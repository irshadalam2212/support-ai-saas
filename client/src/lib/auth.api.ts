import { apiRequest } from "./api";
import type { LoginFormValues, SignupFormValues } from "@/schemas/auth.schema";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
};

export function registerAccount(values: SignupFormValues) {
  return apiRequest<{ user: Pick<AuthUser, "id" | "name" | "email"> }>("/auth/register", {
    name: values.fullName,
    email: values.email,
    company_name: values.companyName,
    password: values.password,
  });
}

export async function loginAccount(values: LoginFormValues) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    email: values.email,
    password: values.password,
  });
  return { ...response.data, rememberMe: values.rememberMe };
}

export function saveAuthSession(session: LoginResponse, rememberMe: boolean) {
  sessionStorage.removeItem("supportai.auth");
  localStorage.removeItem("supportai.auth");
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("supportai.auth", JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: session.user,
  }));
}
