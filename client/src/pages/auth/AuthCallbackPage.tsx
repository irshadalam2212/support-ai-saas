import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";

import AuthLayout from "@/components/auth/AuthLayout";
import { buttonVariants } from "@/components/ui/button";
import { ensureInitialWorkspace, syncCurrentProfile } from "@/lib/fastapi.api";
import { invitationPath, pendingInvitationToken } from "@/lib/invitations";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Verifying your email link…");
  // Only set when something went wrong; success navigates straight to the overview.
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let syncStarted = false;
    const syncAndContinue = async ({ access_token: accessToken, user }: Session) => {
      if (!active || syncStarted) return;
      syncStarted = true;
      try {
        await syncCurrentProfile(accessToken);
        // Invited people go back to their invitation instead of getting a workspace of their own.
        const invitationToken = pendingInvitationToken(user);
        if (!invitationToken) await ensureInitialWorkspace(accessToken);
        if (active) navigate(invitationToken ? invitationPath(invitationToken) : "/overview", { replace: true });
      } catch {
        if (!active) return;
        setMessage("Your email is confirmed, but we couldn't finish setting up your workspace. Sign in again to retry.");
        setFailed(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void syncAndContinue(session);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setMessage("We could not verify this link. Request a new confirmation email and try again.");
        setFailed(true);
      } else if (data.session) {
        void syncAndContinue(data.session);
      } else {
        setMessage("This link is invalid or expired. Request a new confirmation email and try again.");
        setFailed(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthLayout title={failed ? "Email confirmation" : "Confirming your email"}>
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl",
            failed ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary",
          )}
        >
          {failed
            ? <CircleAlert aria-hidden="true" className="size-6" />
            : <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />}
        </span>
        <p aria-live="polite" className="mt-4 text-sm leading-6 text-muted-foreground">{message}</p>
        {failed && (
          <Link to="/login" className={cn(buttonVariants(), "mt-6 h-11 w-full")}>Back to sign in</Link>
        )}
      </div>
    </AuthLayout>
  );
}
