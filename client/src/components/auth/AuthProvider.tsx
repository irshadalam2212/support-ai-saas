import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { AuthContext } from "@/components/auth/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      // Never show one account's cached data to the next person who signs in.
      if (event === "SIGNED_OUT") queryClient.clear();
      setSession(nextSession);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(error ? null : data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo(() => ({ session, loading }), [session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
