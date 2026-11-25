import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Use "h1" when this is the whole page. */
  headingLevel?: "h1" | "h2";
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingLevel: Heading = "h2",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <Heading className="mt-4 text-base font-semibold">{title}</Heading>
      {description && <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
