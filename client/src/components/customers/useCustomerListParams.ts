import { useCallback } from "react";
import { useSearchParams } from "react-router";

import type { CustomerSort } from "@/lib/customers.api";

export const SORT_OPTIONS: { value: CustomerSort; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
];

/** Search, sort, and page live in the address, so they survive reloads and can be shared. */
export function useCustomerListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").slice(0, 120);
  const sort = SORT_OPTIONS.find((option) => option.value === searchParams.get("sort"))?.value ?? "name";
  const requested = Number(searchParams.get("page"));
  const page = Number.isInteger(requested) && requested > 0 ? Math.min(requested, 100_000) : 1;

  const update = useCallback(
    (changes: { q?: string; sort?: CustomerSort; page?: number }) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          // A new search or order starts again from the first page.
          if (changes.q !== undefined || changes.sort !== undefined) next.delete("page");
          for (const [key, value] of Object.entries(changes)) {
            const isDefault = value === "" || (key === "sort" && value === "name") || (key === "page" && value === 1);
            if (isDefault) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setQuery = useCallback((value: string) => update({ q: value }), [update]);

  return { q, sort, page, update, setQuery };
}
