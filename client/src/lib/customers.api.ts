import { z } from "zod";

import { apiRequest } from "@/lib/fastapi.api";
import type { CustomerFormValues } from "@/schemas/customer.schema";

const customerResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

const customerListResponseSchema = z.object({
  items: z.array(customerResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export type Customer = z.infer<typeof customerResponseSchema>;
export type CustomerList = z.infer<typeof customerListResponseSchema>;
export type CustomerSort = "name" | "-name" | "created_at" | "-created_at";

function customersPath(workspaceId: string, customerId?: string) {
  const base = `/workspaces/${encodeURIComponent(workspaceId)}/customers`;
  return customerId ? `${base}/${encodeURIComponent(customerId)}` : base;
}

function toCustomer(result: unknown): Customer {
  const parsed = customerResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected customer response.");
  return parsed.data;
}

/** Empty optional fields are sent as null so they are cleared. */
function toPayload({ name, email, phone, company }: CustomerFormValues) {
  return { name, email, phone: phone || null, company: company || null };
}

export async function listCustomers(
  accessToken: string,
  workspaceId: string,
  { q, sort, page, pageSize }: { q: string; sort: CustomerSort; page: number; pageSize: number },
): Promise<CustomerList> {
  const params = new URLSearchParams({ sort, page: String(page), page_size: String(pageSize) });
  if (q.trim()) params.set("q", q.trim());
  const result = await apiRequest(`${customersPath(workspaceId)}?${params}`, accessToken, "GET");
  const parsed = customerListResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("SupportAI returned an unexpected customer list.");
  return parsed.data;
}

export async function createCustomer(accessToken: string, workspaceId: string, values: CustomerFormValues) {
  return toCustomer(await apiRequest(customersPath(workspaceId), accessToken, "POST", toPayload(values)));
}

export async function updateCustomer(
  accessToken: string,
  workspaceId: string,
  customerId: string,
  values: CustomerFormValues,
) {
  return toCustomer(
    await apiRequest(customersPath(workspaceId, customerId), accessToken, "PATCH", toPayload(values)),
  );
}

export async function deleteCustomer(accessToken: string, workspaceId: string, customerId: string): Promise<void> {
  await apiRequest(customersPath(workspaceId, customerId), accessToken, "DELETE");
}
