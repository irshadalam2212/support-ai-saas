import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheck, LoaderCircle } from "lucide-react";

import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureInitialWorkspace, syncCurrentProfile } from "@/lib/fastapi.api";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Verifying your email link…");
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let syncStarted = false;
    const syncAndContinue = async (accessToken: string) => {
      if (!active || syncStarted) return;
      syncStarted = true;
      try {
        await syncCurrentProfile(accessToken);
        await ensureInitialWorkspace(accessToken);
        if (active) navigate("/dashboard", { replace: true });
      } catch {
        if (!active) return;
        setMessage("Your email is confirmed, but we couldn't finish setting up your workspace. Sign in again to retry.");
        setCompleted(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void syncAndContinue(session.access_token);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setMessage("We could not verify this link. Request a new confirmation email and try again.");
        setCompleted(true);
      } else if (data.session) {
        void syncAndContinue(data.session.access_token);
      } else {
        setMessage("This link is invalid or expired. Request a new confirmation email and try again.");
        setCompleted(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-background lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <AuthBrandPanel />
      <main className="flex min-h-[calc(100dvh-16rem)] items-center justify-center px-4 py-10 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:col-start-2 lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:px-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {completed ? (
              <CircleCheck aria-hidden="true" className="size-5" />
            ) : (
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            )}
          </div>
          <CardTitle>{completed ? "Email confirmation" : "Confirming your email"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p aria-live="polite" className="text-sm text-muted-foreground">{message}</p>
          {completed && (
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Back to sign in
            </Link>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
