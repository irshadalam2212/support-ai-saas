import { Users } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function CustomersPage() {
  return (
    <FeatureStatusPage
      title="Customers"
      description="Customer records and their support history for this workspace."
      icon={Users}
    />
  );
}
