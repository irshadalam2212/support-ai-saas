import { TriangleAlert } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import EmptyState from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import NotFoundPage from "@/pages/NotFoundPage";

export default function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <EmptyState
        headingLevel="h1"
        icon={TriangleAlert}
        title="Something went wrong"
        description="This page could not be displayed. Reload to try again."
        action={
          <>
            <Button type="button" onClick={() => window.location.reload()}>Reload page</Button>
            <Link to="/" reloadDocument className={buttonVariants({ variant: "outline" })}>Go to home page</Link>
          </>
        }
      />
    </main>
  );
}
