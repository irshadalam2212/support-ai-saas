import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  error: { icon: CircleAlert, className: "border-destructive/30 bg-destructive/5 text-destructive" },
  success: { icon: CircleCheck, className: "border-success/30 bg-success/5 text-success" },
  warning: { icon: TriangleAlert, className: "border-warning/30 bg-warning/5 text-warning" },
  info: { icon: Info, className: "border-info/30 bg-info/5 text-info" },
};

type NoticeProps = {
  tone: keyof typeof tones;
  children: ReactNode;
  className?: string;
};

/** Inline feedback for a form or section. Errors are announced immediately. */
export default function Notice({ tone, children, className }: NoticeProps) {
  const { icon: Icon, className: toneClassName } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", toneClassName, className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
