import { CreditCard } from "lucide-react";

import FeatureStatusPage from "@/components/shared/FeatureStatusPage";

export default function BillingPage() {
  return (
    <FeatureStatusPage
      title="Billing"
      description="Plans and payment history."
      icon={CreditCard}
    />
  );
}
