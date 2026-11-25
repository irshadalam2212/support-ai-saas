import { Building2 } from "lucide-react";

import type { InvitationPreview } from "@/lib/fastapi.api";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";

export default function InvitationSummary({ invitation }: { invitation: InvitationPreview }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Building2 aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 text-sm">
        <p>
          You're invited to join <strong className="break-words">{invitation.workspace_name}</strong> as{" "}
          <strong>{ROLE_LABELS[invitation.role]}</strong>.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Expires {formatDate(invitation.expires_at)}</p>
      </div>
    </div>
  );
}
