import { ChartNoAxesCombined } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function AnalyticsPage() {
  return (
    <FeatureStatusPage
      title="Analytics"
      description="Ticket volume, resolution and response times, and AI usage."
      icon={ChartNoAxesCombined}
    />
  );
}
