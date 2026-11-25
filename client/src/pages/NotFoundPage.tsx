import { FileQuestion } from "lucide-react";
import { Link } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import EmptyState from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  const { session } = useAuth();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <EmptyState
        headingLevel="h1"
        icon={FileQuestion}
        title="Page not found"
        description="The address may be mistyped, or the page may not exist yet."
        action={
          <Link to={session ? "/overview" : "/"} className={buttonVariants()}>
            {session ? "Back to overview" : "Go to home page"}
          </Link>
        }
      />
    </main>
  );
}
