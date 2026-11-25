import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Bot,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  Inbox,
  Plus,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { getWorkspaceMembers } from "@/lib/fastapi.api";
import { canManageWorkspace, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

const upcoming = [
  { icon: Inbox, label: "Conversations", detail: "Tickets, replies, and internal notes" },
  { icon: BookOpen, label: "Knowledge base", detail: "Documents that answers are based on" },
  { icon: Bot, label: "AI assistant", detail: "Suggested answers with sources" },
  { icon: ChartNoAxesCombined, label: "Analytics", detail: "Ticket volume and response times" },
];

type SummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  detail: string;
  className?: string;
};

function SummaryCard({ icon: Icon, label, value, detail, className }: SummaryCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <h2 className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </h2>
      <div className="mt-3 truncate text-xl font-semibold">{value}</div>
      <p className="mt-1 text-sm break-words text-muted-foreground">{detail}</p>
    </Card>
  );
}

type RowContentProps = {
  icon: LucideIcon;
  label: string;
  detail: string;
  muted?: boolean;
};

function RowContent({ icon: Icon, label, detail, muted = false }: RowContentProps) {
  return (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          muted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        <span className="block text-muted-foreground">{detail}</span>
      </span>
    </>
  );
}

export default function OverviewPage() {
  const { session } = useAuth();
  const { activeWorkspace, workspaces } = useWorkspace();
  const canManage = canManageWorkspace(activeWorkspace?.role);
  // Same query key as the team page, so the two share cached data.
  const membersQuery = useQuery({
    queryKey: ["workspace-members", activeWorkspace?.id],
    queryFn: () => getWorkspaceMembers(session!.access_token, activeWorkspace!.id),
    enabled: Boolean(session?.access_token && activeWorkspace?.id && canManage),
  });

  if (!activeWorkspace) return null;

  const isCustomer = activeWorkspace.role === "CUSTOMER";
  const actions = [
    ...(canManage
      ? [
        { to: "/settings/team", icon: UserPlus, label: "Invite your team", detail: "Send an invitation and choose a role" },
        { to: "/settings", icon: Settings, label: "Edit workspace details", detail: "Update the name and description" },
      ]
      : [{ to: "/settings", icon: Settings, label: "View settings", detail: "See your profile and workspace details" }]),
    { to: "/settings#create-workspace", icon: Plus, label: "Create another workspace", detail: "You will be its owner" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={
          isCustomer
            ? `You have customer access to ${activeWorkspace.name}. Support requests aren't available yet.`
            : `What's set up in ${activeWorkspace.name}.`
        }
      />

      <div className={cn("grid gap-4 sm:grid-cols-2", canManage && "lg:grid-cols-3")}>
        <SummaryCard
          icon={Building2}
          label="Workspace"
          value={activeWorkspace.name}
          detail={`${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} available to you`}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Your role"
          value={ROLE_LABELS[activeWorkspace.role]}
          detail={ROLE_DESCRIPTIONS[activeWorkspace.role]}
        />
        {canManage && (
          <SummaryCard
            className="sm:col-span-2 lg:col-span-1"
            icon={Users}
            label="Team members"
            value={
              membersQuery.isPending ? (
                <>
                  <Skeleton className="h-7 w-12" />
                  <span className="sr-only">Loading member count</span>
                </>
              ) : membersQuery.isError ? "Unavailable" : membersQuery.data.length
            }
            detail={membersQuery.isError ? "The member count could not be loaded." : "People with access to this workspace"}
          />
        )}
      </div>

      <div className={cn("grid items-start gap-4", !isCustomer && "lg:grid-cols-2")}>
        <Card>
          <h2 className="border-b px-5 py-4 font-semibold">Quick actions</h2>
          <ul className="divide-y">
            {actions.map(({ to, ...action }) => (
              <li key={action.label}>
                <Link
                  to={to}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50 focus-visible:-outline-offset-2"
                >
                  <RowContent {...action} />
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {!isCustomer && (
          <Card>
            <h2 className="border-b px-5 py-4 font-semibold">Coming soon</h2>
            <ul className="divide-y">
              {upcoming.map((feature) => (
                <li key={feature.label} className="flex items-center gap-3 px-5 py-3.5">
                  <RowContent {...feature} muted />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
