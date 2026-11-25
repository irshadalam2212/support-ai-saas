import { CircleAlert, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
};

export default function ErrorState({ title, message, onRetry, retrying = false, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <CircleAlert aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 break-words text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" className="mt-5" onClick={onRetry} disabled={retrying}>
        <RotateCw aria-hidden="true" className={cn(retrying && "animate-spin")} />
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
