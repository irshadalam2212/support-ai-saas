import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type TextFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  icon?: LucideIcon;
  /** Shown opposite the label, for example a "Forgot password?" link. */
  labelAction?: ReactNode;
  /** A control placed inside the right edge of the input. */
  trailing?: ReactNode;
};

export default function TextField({
  id,
  label,
  error,
  icon: Icon,
  labelAction,
  trailing,
  className,
  "aria-describedby": describedBy,
  ...inputProps
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        )}
        <Input
          {...inputProps}
          id={id}
          className={cn("h-11", Icon && "pl-10", trailing && "pr-12", className)}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(error && errorId, describedBy) || undefined}
        />
        {trailing}
      </div>
      {error && <p id={errorId} className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
