import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Plus, Shield, Users } from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWorkspaceInvitation,
  getWorkspaceMembers,
  type WorkspaceInvitation,
} from "@/lib/fastapi.api";

type InviteRole = "ADMIN" | "AGENT" | "CUSTOMER";

export default function TeamMembersPage() {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("AGENT");
  const [createdInvitation, setCreatedInvitation] = useState<WorkspaceInvitation | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const canManage = activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  const membersQuery = useQuery({
    queryKey: ["workspace-members", activeWorkspace?.id],
    queryFn: () => getWorkspaceMembers(session!.access_token, activeWorkspace!.id),
    enabled: Boolean(session?.access_token && activeWorkspace?.id && canManage),
  });
  const members = membersQuery.data ?? [];

  const invitationMutation = useMutation({
    mutationFn: () => createWorkspaceInvitation(
      session!.access_token,
      activeWorkspace!.id,
      email,
      role,
    ),
    onSuccess: async (invitation) => {
      setCreatedInvitation(invitation);
      setCopyMessage("");
      setEmail("");
      await queryClient.invalidateQueries({ queryKey: ["workspace-members", activeWorkspace?.id] });
    },
  });

  async function copyInvitationLink() {
    try {
      await navigator.clipboard.writeText(createdInvitation!.invitation_url);
      setCopyMessage("Invitation link copied.");
    } catch {
      setCopyMessage("Copy failed. Select and copy the link above.");
    }
  }

  if (!activeWorkspace) {
    return <p className="text-sm text-muted-foreground">Select a workspace to manage its members.</p>;
  }

  if (!canManage) {
    return (
      <Card className="p-6">
        <h1 className="text-xl font-semibold">Team Members</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only workspace owners and admins can view the full member list or invite teammates.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <Users aria-hidden="true" className="size-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Team Members</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage access to {activeWorkspace.name}.
        </p>
      </header>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Invite a team member</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Invitations expire after seven days. Owners cannot be assigned through an invitation.
            </p>
          </div>
        </div>

        <form
          className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            setCreatedInvitation(null);
            invitationMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as InviteRole)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="ADMIN">Admin</option>
              <option value="AGENT">Agent</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          <Button type="submit" disabled={invitationMutation.isPending || !email.trim()}>
            <Plus aria-hidden="true" className="mr-2 size-4" />
            {invitationMutation.isPending ? "Sending…" : "Send invite"}
          </Button>
        </form>

        {invitationMutation.isError && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {invitationMutation.error.message}
          </p>
        )}

        {createdInvitation && (
          <div className="mt-5 rounded-lg border bg-muted/20 p-4" role="status">
            <p className="font-medium">
              {createdInvitation.email_sent
                ? `Invitation email sent to ${createdInvitation.email}.`
                : `Invitation created, but email could not be sent to ${createdInvitation.email}.`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {createdInvitation.email_sent
                ? "You can also copy the invitation link."
                : "Share this link directly. Configure SMTP to send invitation emails automatically."}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input aria-label="Invitation link" readOnly value={createdInvitation.invitation_url} />
              <Button type="button" variant="outline" onClick={() => void copyInvitationLink()}>
                Copy link
              </Button>
            </div>
            {copyMessage && <p className="mt-2 text-xs text-muted-foreground">{copyMessage}</p>}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-semibold">Workspace members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current members of {activeWorkspace.name}.
          </p>
        </div>

        {membersQuery.isLoading ? (
          <p className="p-6 text-sm text-muted-foreground" role="status">Loading members…</p>
        ) : membersQuery.isError ? (
          <p className="p-6 text-sm text-destructive" role="alert">{membersQuery.error.message}</p>
        ) : members.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Member</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const displayName = member.full_name || member.email || "Workspace member";
                  const initials = displayName.slice(0, 2).toUpperCase();
                  return (
                    <tr key={member.user_id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{displayName}</p>
                            {member.email && (
                              <p className="max-w-xs truncate text-xs text-muted-foreground" title={member.email}>
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2">
                          <Shield aria-hidden="true" className="size-4 text-muted-foreground" />
                          <Badge variant="outline">{member.role}</Badge>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
