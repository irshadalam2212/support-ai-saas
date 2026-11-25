import { Inbox } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function ConversationsPage() {
  return (
    <FeatureStatusPage
      title="Conversations"
      description="Customer tickets, replies, internal notes, assignments, and status."
      icon={Inbox}
    />
  );
}
