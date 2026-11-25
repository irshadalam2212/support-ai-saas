import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  /** Read by screen readers while the placeholders are visible. */
  label: string;
  rows?: number;
  className?: string;
};

export default function LoadingState({ label, rows = 3, className }: LoadingStateProps) {
  return (
    <div role="status" className={cn("space-y-3", className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn("h-10", index === rows - 1 && "w-2/3")} />
      ))}
    </div>
  );
}
