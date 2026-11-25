import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Send } from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import SettingsSection from "@/components/settings/SettingsSection";
import Notice from "@/components/shared/Notice";
import InvitationResult from "@/components/team/InvitationResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWorkspaceInvitation } from "@/lib/fastapi.api";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/roles";

type InviteRole = "ADMIN" | "AGENT" | "CUSTOMER";

/** Ownership cannot be granted through an invitation. */
const INVITE_ROLES: InviteRole[] = ["ADMIN", "AGENT", "CUSTOMER"];
const ROLE_ITEMS = INVITE_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }));

export default function InviteMemberSection({ workspaceId }: { workspaceId: string }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("AGENT");

  const invitationMutation = useMutation({
    mutationFn: () => createWorkspaceInvitation(session!.access_token, workspaceId, email.trim(), role),
    onSuccess: async () => {
      setEmail("");
      await queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });

  return (
    <SettingsSection
      title="Invite a member"
      description="Invitations expire after seven days. Ownership cannot be granted by invitation."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          invitationMutation.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              required
              maxLength={320}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@company.com"
            />
          </div>
          {/* Flex gap, not margins: the select adds a hidden input that would shift the control up. */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select items={ROLE_ITEMS} value={role} onValueChange={(value) => value && setRole(value)}>
              <SelectTrigger id="invite-role" aria-describedby="invite-role-hint" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {ROLE_ITEMS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={invitationMutation.isPending || !email.trim()}>
            {invitationMutation.isPending
              ? <LoaderCircle aria-hidden="true" className="animate-spin" />
              : <Send aria-hidden="true" />}
            {invitationMutation.isPending ? "Sending…" : "Send invite"}
          </Button>
        </div>
        <p id="invite-role-hint" className="text-xs text-muted-foreground">
          {ROLE_LABELS[role]}: {ROLE_DESCRIPTIONS[role]}
        </p>
        {invitationMutation.isError && <Notice tone="error">{invitationMutation.error.message}</Notice>}
        {invitationMutation.isSuccess && (
          <InvitationResult key={invitationMutation.data.id} invitation={invitationMutation.data} />
        )}
      </form>
    </SettingsSection>
  );
}
