import { MessageSquare } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function ConversationDetailPage() {
  return (
    <FeatureStatusPage
      title="Conversation"
      description="The message history, internal notes, and details of one ticket."
      icon={MessageSquare}
    />
  );
}
