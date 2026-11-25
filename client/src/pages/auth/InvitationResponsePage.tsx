import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import Notice from "@/components/shared/Notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { respondToWorkspaceInvitation } from "@/lib/fastapi.api";
import { cn } from "@/lib/utils";

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
    <AuthLayout title="Workspace invitation">
      <div className="space-y-5">
        {!invitationToken && !decision ? (
          <>
            <Notice tone="error">
              This invitation link is missing its token. Ask the workspace owner for a new invitation.
            </Notice>
            <Link to="/" className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}>Go to home page</Link>
          </>
        ) : decision ? (
          <>
            <Notice tone={decision === "ACCEPTED" ? "success" : "info"}>
              {decision === "ACCEPTED"
                ? "Invitation accepted. You now have access to the workspace."
                : "Invitation declined."}
            </Notice>
            <Link to="/overview" className={cn(buttonVariants(), "h-11 w-full")}>Go to your workspace</Link>
          </>
        ) : loading ? (
          <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Checking your sign-in…
          </p>
        ) : !session ? (
          <>
            <p className="text-center text-sm leading-6 text-muted-foreground">
              To accept or decline, sign in with the email address that received this invitation.
            </p>
            <Link to="/login" state={{ returnTo }} className={cn(buttonVariants(), "h-11 w-full")}>
              Sign in to continue
            </Link>
            <Link
              to="/signup"
              state={{ returnTo }}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            <p className="text-center text-sm leading-6 break-words text-muted-foreground">
              You are signed in as <strong className="text-foreground">{session.user.email}</strong>. This invitation
              can only be used by the email address it was sent to.
            </p>
            {responseMutation.isError && <Notice tone="error">{responseMutation.error.message}</Notice>}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                className="h-11"
                disabled={responseMutation.isPending}
                onClick={() => responseMutation.mutate("accept")}
              >
                {responseMutation.isPending && responseMutation.variables === "accept" && (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                )}
                Accept invitation
              </Button>
              <Button
                variant="outline"
                className="h-11"
                disabled={responseMutation.isPending}
                onClick={() => responseMutation.mutate("decline")}
              >
                {responseMutation.isPending && responseMutation.variables === "decline" && (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                )}
                Decline
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
