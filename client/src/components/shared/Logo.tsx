import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Use on dark backgrounds. */
  inverted?: boolean;
  textClassName?: string;
};

export default function Logo({ className, inverted = false, textClassName }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          inverted ? "border border-white/10 bg-white/10 text-violet-200" : "bg-primary text-primary-foreground",
        )}
      >
        <Sparkles aria-hidden="true" className="size-4" />
      </span>
      <span className={cn("truncate text-base font-semibold tracking-tight", textClassName)}>SupportAI</span>
    </span>
  );
}
