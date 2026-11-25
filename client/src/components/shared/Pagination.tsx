import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
      <p aria-live="polite" className="text-muted-foreground">
        Showing {first}–{last} of {total}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
          <span className="text-muted-foreground">Page {page} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </nav>
  );
}
