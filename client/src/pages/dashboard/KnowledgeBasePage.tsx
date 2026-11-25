import { BookOpen } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function KnowledgeBasePage() {
  return (
    <FeatureStatusPage
      title="Knowledge base"
      description="The documents and sources that support answers will be based on."
      icon={BookOpen}
    />
  );
}
