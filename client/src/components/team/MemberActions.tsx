import { Crown, Ellipsis, UserMinus } from "lucide-react";

import type { MemberAction } from "@/components/team/memberAction";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkspaceMemberSummary } from "@/lib/fastapi.api";
import { getMemberName } from "@/lib/format";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type AssignableRole } from "@/lib/roles";

type MemberActionsProps = {
  member: WorkspaceMemberSummary;
  onAction: (action: MemberAction) => void;
  canTransfer: boolean;
};

export default function MemberActions({ member, onAction, canTransfer }: MemberActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" />}
        aria-label={`Actions for ${getMemberName(member)}`}
      >
        <Ellipsis aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2">Change role</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={member.role}
            onValueChange={(role: AssignableRole) => {
              if (role !== member.role) onAction({ type: "role", member, role });
            }}
          >
            {ASSIGNABLE_ROLES.map((role) => (
              <DropdownMenuRadioItem key={role} value={role} closeOnClick className="px-2 py-2 pointer-coarse:py-3">
                {ROLE_LABELS[role]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {canTransfer && (
          <DropdownMenuItem
            className="gap-2 px-2 py-2 pointer-coarse:py-3"
            onClick={() => onAction({ type: "transfer", member })}
          >
            <Crown aria-hidden="true" />
            Transfer ownership
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          className="gap-2 px-2 py-2 pointer-coarse:py-3"
          onClick={() => onAction({ type: "remove", member })}
        >
          <UserMinus aria-hidden="true" />
          Remove from workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
