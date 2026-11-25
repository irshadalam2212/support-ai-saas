import { MessageSquare } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function CustomerChatPage() {
  return (
    <FeatureStatusPage
      title="Customer support chat"
      description="Ask a question and follow the conversation with the support team."
      icon={MessageSquare}
      standalone
      backTo="/"
      backLabel="Go to home page"
    />
  );
}
