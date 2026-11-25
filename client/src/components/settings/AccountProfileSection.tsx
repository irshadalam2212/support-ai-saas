import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthContext";
import SettingsSection from "@/components/settings/SettingsSection";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import UserAvatar from "@/components/shared/UserAvatar";
import { getAuthenticatedUser, getCurrentProfile } from "@/lib/fastapi.api";

export default function AccountProfileSection() {
  const { session } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["current-profile", session?.user.id],
    queryFn: () => getCurrentProfile(session!.access_token),
    enabled: Boolean(session?.access_token),
  });
  const accountQuery = useQuery({
    queryKey: ["verified-account", session?.user.id],
    queryFn: () => getAuthenticatedUser(session!.access_token),
    enabled: Boolean(session?.access_token),
  });
  const error = profileQuery.error ?? accountQuery.error;
  const email = accountQuery.data?.email ?? profileQuery.data?.email;
  const name = profileQuery.data?.full_name;

  return (
    <SettingsSection title="Your profile" description="The account you are signed in with.">
      {profileQuery.isPending || accountQuery.isPending ? (
        <LoadingState label="Loading your profile" rows={2} />
      ) : error ? (
        <ErrorState
          className="py-2"
          title="Couldn't load your profile"
          message={error.message}
          onRetry={() => {
            void profileQuery.refetch();
            void accountQuery.refetch();
          }}
          retrying={profileQuery.isFetching || accountQuery.isFetching}
        />
      ) : (
        <div className="flex items-center gap-4">
          <UserAvatar name={name || email || "Account"} className="data-[size=default]:size-12" />
          <dl className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="mt-0.5 font-medium break-words">{name || "Not set"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-0.5 font-medium break-all">{email ?? "Not set"}</dd>
            </div>
          </dl>
        </div>
      )}
    </SettingsSection>
  );
}
