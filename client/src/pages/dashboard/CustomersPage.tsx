import { Lock } from "lucide-react";
import { Link } from "react-router";

import CustomerDirectory from "@/components/customers/CustomerDirectory";
import EmptyState from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { isStaff } from "@/lib/roles";

export default function CustomersPage() {
  const { activeWorkspace } = useWorkspace();

  if (!activeWorkspace) return null;

  if (!isStaff(activeWorkspace.role)) {
    return (
      <Card className="mx-auto max-w-xl">
        <EmptyState
          headingLevel="h1"
          icon={Lock}
          title="Customers"
          description="Only the support team can view customer records."
          action={<Link to="/overview" className={buttonVariants({ variant: "outline" })}>Back to overview</Link>}
        />
      </Card>
    );
  }

  // Keyed so an open panel or message never carries over to another workspace.
  return <CustomerDirectory key={activeWorkspace.id} workspace={activeWorkspace} />;
}
