import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { respondToWorkspaceInvitation } from "@/lib/fastapi.api";

export default function InvitationResponsePage() {
  const { session, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const invitationToken = searchParams.get("token") ?? "";

  const responseMutation = useMutation({
    mutationFn: (action: "accept" | "decline") =>
      respondToWorkspaceInvitation(session!.access_token, action, invitationToken),
    onSuccess: (result) => {
      setDecision(result.status);
      navigate("/invitations/respond", { replace: true });
    },
  });

  const returnTo = `${location.pathname}${location.search}`;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Workspace invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!invitationToken && !decision ? (
            <p className="text-sm text-destructive" role="alert">
              This invitation link is missing its token. Ask the workspace owner for a new invitation.
            </p>
          ) : decision ? (
            <div className="space-y-3" role="status">
              <p className="font-medium">
                {decision === "ACCEPTED"
                  ? "Invitation accepted. You now have access to the workspace."
                  : "Invitation declined."}
              </p>
              {decision === "ACCEPTED" && (
                <Button onClick={() => navigate("/dashboard")}>Go to your dashboard</Button>
              )}
            </div>
          ) : loading ? (
            <p className="text-sm text-muted-foreground" role="status">Checking your sign-in…</p>
          ) : !session ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in with the email address that received this invitation to accept or decline it.
              </p>
              <Button onClick={() => navigate("/login", { state: { returnTo } })}>
                Sign in to continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Review this invitation using the account signed in as <strong>{session.user.email}</strong>.
                The invitation can only be used by its intended email address.
              </p>
              {responseMutation.isError && (
                <p className="text-sm text-destructive" role="alert">
                  {responseMutation.error.message}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={responseMutation.isPending}
                  onClick={() => responseMutation.mutate("accept")}
                >
                  {responseMutation.isPending ? "Submitting…" : "Accept invitation"}
                </Button>
                <Button
                  variant="outline"
                  disabled={responseMutation.isPending}
                  onClick={() => responseMutation.mutate("decline")}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
