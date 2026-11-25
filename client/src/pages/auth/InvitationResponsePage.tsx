import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import InvitationSummary from "@/components/auth/InvitationSummary";
import InvitedSignupForm from "@/components/auth/InvitedSignupForm";
import ErrorState from "@/components/shared/ErrorState";
import Notice from "@/components/shared/Notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { registerInvitedAccount } from "@/lib/auth.api";
import { previewWorkspaceInvitation } from "@/lib/fastapi.api";
import { answerInvitation, clearPendingInvitation, invitationPath, pendingInvitationToken } from "@/lib/invitations";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { InvitedSignupFormValues } from "@/schemas/auth.schema";

/** Responses that mean this link will never work again. */
const DEAD_LINK_STATUSES = [404, 409, 410];

const linkClass = (variant: "default" | "outline" = "default") => cn(buttonVariants({ variant }), "h-11 w-full");

function Waiting({ label }: { label: string }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      {label}
    </p>
  );
}

export default function InvitationResponsePage() {
  const { session, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const token = searchParams.get("token") ?? "";

  const previewQuery = useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => previewWorkspaceInvitation(token),
    enabled: token !== "",
    refetchOnWindowFocus: false,
  });
  const invitation = previewQuery.data;
  const deadLink = previewQuery.error instanceof ApiError && DEAD_LINK_STATUSES.includes(previewQuery.error.status);
  const storedToken = pendingInvitationToken(session?.user);

  useEffect(() => {
    if (deadLink && storedToken === token) void clearPendingInvitation();
  }, [deadLink, storedToken, token]);

  // Both mutations live here: the form disappears as soon as Supabase signs the new person in.
  const joinMutation = useMutation({
    mutationFn: (values: InvitedSignupFormValues) =>
      registerInvitedAccount({ ...values, email: invitation!.email, invitationToken: token }),
    onSuccess: ({ requiresEmailConfirmation }) => {
      if (requiresEmailConfirmation) return;
      queryClient.removeQueries({ queryKey: ["workspaces"] });
      navigate("/overview", { replace: true });
    },
  });

  const responseMutation = useMutation({
    mutationFn: (action: "accept" | "decline") =>
      answerInvitation(session!.access_token, session!.user, action, token),
    onSuccess: (result) => {
      queryClient.removeQueries({ queryKey: ["workspaces"] });
      setDecision(result.status);
      navigate("/invitations/respond", { replace: true });
    },
  });

  function content() {
    if (decision) {
      return (
        <>
          <Notice tone={decision === "ACCEPTED" ? "success" : "info"}>
            {decision === "ACCEPTED"
              ? "Invitation accepted. You now have access to the workspace."
              : "Invitation declined."}
          </Notice>
          <Link to="/overview" className={linkClass()}>Go to your workspace</Link>
        </>
      );
    }
    if (!token) {
      return (
        <>
          <Notice tone="error">
            This invitation link is missing its token. Ask the workspace owner for a new invitation.
          </Notice>
          <Link to="/" className={linkClass("outline")}>Go to home page</Link>
        </>
      );
    }
    if (joinMutation.isPending) return <Waiting label="Creating your account…" />;
    if (joinMutation.data?.requiresEmailConfirmation) {
      return (
        <Notice tone="info">
          Check {invitation?.email} and confirm your email address. The link brings you back here to accept the
          invitation.
        </Notice>
      );
    }
    if (loading || previewQuery.isPending) return <Waiting label="Checking your invitation…" />;
    if (deadLink) {
      return (
        <>
          <Notice tone="error">{previewQuery.error!.message}. Ask the workspace owner for a new invitation.</Notice>
          <Link to={session ? "/overview" : "/login"} className={linkClass("outline")}>
            {session ? "Go to your workspace" : "Go to sign in"}
          </Link>
        </>
      );
    }
    if (!invitation) {
      return (
        <ErrorState
          className="py-0"
          title="Couldn't load the invitation"
          message={getApiErrorMessage(previewQuery.error)}
          onRetry={() => void previewQuery.refetch()}
          retrying={previewQuery.isFetching}
        />
      );
    }

    if (!session) {
      return (
        <>
          <InvitationSummary invitation={invitation} />
          <InvitedSignupForm
            email={invitation.email}
            pending={joinMutation.isPending}
            error={joinMutation.error?.message}
            onSubmit={(values) => joinMutation.mutate(values)}
          />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ returnTo: invitationPath(token), email: invitation.email }}
              className="rounded-sm font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </>
      );
    }

    const wrongAccount = session.user.email?.toLowerCase() !== invitation.email;
    // Shown if creating the account worked but joining did not.
    const error = responseMutation.error ?? joinMutation.error;

    return (
      <>
        <InvitationSummary invitation={invitation} />
        {wrongAccount ? (
          <>
            <Notice tone="warning">
              You are signed in as {session.user.email}, but this invitation is for {invitation.email}.
            </Notice>
            <Button className="h-11 w-full" onClick={() => void supabase.auth.signOut()}>
              Sign out and continue
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-sm wrap-break-word text-muted-foreground">
              You are signed in as <strong className="text-foreground">{session.user.email}</strong>.
            </p>
            {error && <Notice tone="error">{error.message}</Notice>}
            <div className="grid gap-3 sm:grid-cols-2">
              {(["accept", "decline"] as const).map((action) => (
                <Button
                  key={action}
                  variant={action === "accept" ? "default" : "outline"}
                  className="h-11"
                  disabled={responseMutation.isPending}
                  onClick={() => responseMutation.mutate(action)}
                >
                  {responseMutation.isPending && responseMutation.variables === action && (
                    <LoaderCircle aria-hidden="true" className="animate-spin" />
                  )}
                  {action === "accept" ? "Accept invitation" : "Decline"}
                </Button>
              ))}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <AuthLayout title="Workspace invitation">
      <div className="space-y-5">{content()}</div>
    </AuthLayout>
  );
}
