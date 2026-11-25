import { useNavigate } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FeatureStatusPageProps = {
  title: string;
  description: string;
  phase?: string;
};

export default function FeatureStatusPage({ title, description, phase }: FeatureStatusPageProps) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      <Card className="space-y-4 p-6 sm:p-8">
        <Badge variant="outline">{phase ? `Planned · ${phase}` : "Not connected yet"}</Badge>
        <div>
          <h2 className="text-lg font-semibold">This feature is not live yet</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            This section will show workspace data after its backend is implemented. Sample records and controls have been removed so the page does not imply that changes are being saved.
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>Return to workspace overview</Button>
      </Card>
    </div>
  );
}
