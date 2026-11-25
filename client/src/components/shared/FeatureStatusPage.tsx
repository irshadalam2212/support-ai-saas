import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import EmptyState from "@/components/shared/EmptyState";
import Logo from "@/components/shared/Logo";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FeatureStatusPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Short status shown beside the title. */
  status?: string;
  /** Set for pages rendered outside the app layout. */
  standalone?: boolean;
  backTo?: string;
  backLabel?: string;
};

export default function FeatureStatusPage({
  title,
  description,
  icon,
  status = "Coming soon",
  standalone = false,
  backTo = "/overview",
  backLabel = "Back to overview",
}: FeatureStatusPageProps) {
  const content = (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={<Badge variant="accent">{status}</Badge>} />
      <Card>
        <EmptyState
          icon={icon}
          title="Not available yet"
          description="There is nothing to view or change here for now."
          action={<Link to={backTo} className={buttonVariants({ variant: "outline" })}>{backLabel}</Link>}
        />
      </Card>
    </div>
  );

  if (!standalone) return content;

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link to="/" className="rounded-md"><Logo /></Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{content}</main>
    </div>
  );
}
