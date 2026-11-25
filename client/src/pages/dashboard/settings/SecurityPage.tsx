import { ShieldCheck } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function SecurityPage() {
  return (
    <FeatureStatusPage
      title="Security"
      description="Workspace security settings and activity history."
      icon={ShieldCheck}
      backTo="/settings"
      backLabel="Back to settings"
    />
  );
}
