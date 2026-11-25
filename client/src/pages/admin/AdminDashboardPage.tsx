import { ShieldCheck } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function AdminDashboardPage() {
  return (
    <FeatureStatusPage
      title="Platform administration"
      description="SupportAI has workspace roles only. Manage your workspace from the overview."
      icon={ShieldCheck}
      standalone
      status="Not available"
      backLabel="Go to overview"
    />
  );
}
