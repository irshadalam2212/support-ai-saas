import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type WorkspaceRole } from "@/lib/roles";

const variants = {
  OWNER: "accent",
  ADMIN: "info",
  AGENT: "secondary",
  CUSTOMER: "outline",
} as const;

export default function RoleBadge({ role }: { role: WorkspaceRole }) {
  return <Badge variant={variants[role]}>{ROLE_LABELS[role]}</Badge>;
}
