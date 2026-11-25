import { useState } from "react";
import { Check, Copy } from "lucide-react";

import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkspaceInvitation } from "@/lib/fastapi.api";

export default function InvitationResult({ invitation }: { invitation: WorkspaceInvitation }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(invitation.invitation_url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="space-y-3">
      <Notice tone={invitation.email_sent ? "success" : "warning"}>
        {invitation.email_sent
          ? `Invitation email sent to ${invitation.email}. You can also share the link below.`
          : `The invitation was created, but we couldn't email ${invitation.email}. Copy the link below and send it to them.`}
      </Notice>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Invitation link"
          readOnly
          value={invitation.invitation_url}
          onFocus={(event) => event.target.select()}
        />
        <Button type="button" variant="outline" onClick={() => void copyLink()}>
          {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copyState === "copied" ? "Copied" : "Copy link"}
        </Button>
      </div>
      <p aria-live="polite" className="text-xs text-destructive empty:hidden">
        {copyState === "failed" && "Copy failed. Select the link above and copy it manually."}
      </p>
    </div>
  );
}
