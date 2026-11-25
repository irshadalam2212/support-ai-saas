import { Plug } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function IntegrationsPage() {
  return (
    <FeatureStatusPage
      title="Integrations"
      description="Connections to the other tools your team uses."
      icon={Plug}
      backTo="/settings"
      backLabel="Back to settings"
    />
  );
}
