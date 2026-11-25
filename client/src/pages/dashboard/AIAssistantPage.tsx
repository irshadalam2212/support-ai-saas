import { Bot } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function AIAssistantPage() {
  return (
    <FeatureStatusPage
      title="AI assistant"
      description="Answers and reply suggestions based on your knowledge base, with sources."
      icon={Bot}
    />
  );
}
