import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";

import { useAuth } from "@/components/auth/AuthContext";
import UserAvatar from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { ROLE_LABELS } from "@/lib/roles";

type AccountMenuProps = {
  signingOut: boolean;
  onSignOut: () => void;
};

export default function AccountMenu({ signingOut, onSignOut }: AccountMenuProps) {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const email = session?.user.email ?? "";
  const metadataName: unknown = session?.user.user_metadata?.full_name;
  const fullName = typeof metadataName === "string" ? metadataName.trim() : "";
  const displayName = fullName || email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-full border-border py-1 pr-2.5 pl-1 pointer-coarse:h-11"
          />
        }
        disabled={signingOut}
        aria-label={`Account menu for ${displayName}`}
      >
        <UserAvatar name={displayName} />
        <span className="hidden max-w-40 truncate sm:block">{signingOut ? "Signing out…" : displayName}</span>
        {signingOut ? (
          <LoaderCircle aria-hidden="true" className="animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown aria-hidden="true" className="text-muted-foreground" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-72 max-w-[calc(100vw-1.5rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2.5 font-normal">
            <UserAvatar name={displayName} className="data-[size=default]:size-10" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
              {fullName && <span className="block truncate">{email}</span>}
              {activeWorkspace && (
                <Badge variant="accent" className="mt-1">{ROLE_LABELS[activeWorkspace.role]}</Badge>
              )}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 px-2 py-2 pointer-coarse:py-3"
          onClick={() => navigate("/settings")}
        >
          <UserRound aria-hidden="true" />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="gap-2 px-2 py-2 pointer-coarse:py-3" onClick={onSignOut}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
