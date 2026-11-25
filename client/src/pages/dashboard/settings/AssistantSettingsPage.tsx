import { Bot } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function AssistantSettingsPage() {
  return (
    <FeatureStatusPage
      title="AI assistant settings"
      description="Controls for how the assistant answers."
      icon={Bot}
      backTo="/settings"
      backLabel="Back to settings"
    />
  );
}
