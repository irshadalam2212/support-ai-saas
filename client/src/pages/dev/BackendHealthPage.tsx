import { useQuery } from "@tanstack/react-query";
import { Activity, CircleCheck, CircleX, LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { getFastApiBaseUrl, getFastApiHealth } from "@/lib/fastapi.api";

export default function BackendHealthPage() {
  const healthQuery = useQuery({
    queryKey: ["fastapi-health"],
    queryFn: ({ signal }) => getFastApiHealth(signal),
    retry: false,
  });

  const checking = healthQuery.isPending || healthQuery.isFetching;
  const healthy = healthQuery.data?.status === "ok";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-base font-medium">FastAPI connection check</h1>
          <CardDescription>
            This developer page checks the React client’s connection to the new FastAPI service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              API endpoint
            </p>
            <code className="mt-1 block break-all text-sm">{getFastApiBaseUrl()}/health</code>
          </div>

          <div aria-live="polite" className="flex items-start gap-3">
            {checking ? (
              <LoaderCircle aria-hidden="true" className="mt-0.5 size-5 animate-spin text-muted-foreground" />
            ) : healthy ? (
              <CircleCheck aria-hidden="true" className="mt-0.5 size-5 text-emerald-600" />
            ) : (
              <CircleX aria-hidden="true" className="mt-0.5 size-5 text-destructive" />
            )}
            <div>
              <p className="font-medium">
                {checking ? "Checking API…" : healthy ? "FastAPI is reachable" : "FastAPI is unavailable"}
              </p>
              {healthy ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Service response: {healthQuery.data?.service}
                </p>
              ) : healthQuery.isError ? (
                <p className="mt-1 text-sm text-destructive">{healthQuery.error.message}</p>
              ) : null}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void healthQuery.refetch()}
            disabled={checking}
          >
            <RefreshCw aria-hidden="true" className="mr-2 size-4" />
            Check again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
