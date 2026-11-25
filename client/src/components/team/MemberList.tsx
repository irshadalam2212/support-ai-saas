import UserAvatar from "@/components/shared/UserAvatar";
import MemberActions from "@/components/team/MemberActions";
import type { MemberAction } from "@/components/team/memberAction";
import RoleBadge from "@/components/team/RoleBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WorkspaceMemberSummary } from "@/lib/fastapi.api";
import { formatDate, getMemberName } from "@/lib/format";
import { canModifyMember, canTransferOwnership, type WorkspaceRole } from "@/lib/roles";

type MemberListProps = {
  members: WorkspaceMemberSummary[];
  currentUserId: string | undefined;
  /** The signed-in user's role, which decides who they can manage. */
  actorRole: WorkspaceRole;
  onAction: (action: MemberAction) => void;
};

function MemberIdentity({ member, isCurrentUser }: { member: WorkspaceMemberSummary; isCurrentUser: boolean }) {
  const name = getMemberName(member);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={name} />
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-medium">
          <span className="truncate" title={name}>{name}</span>
          {isCurrentUser && <Badge variant="secondary">You</Badge>}
        </p>
        {member.full_name && member.email && (
          <p className="truncate text-xs text-muted-foreground" title={member.email}>{member.email}</p>
        )}
      </div>
    </div>
  );
}

/** A table on wider screens and a stacked list on phones. */
export default function MemberList({ members, currentUserId, actorRole, onAction }: MemberListProps) {
  const canModify = (member: WorkspaceMemberSummary) => canModifyMember(actorRole, member.role);
  const showActions = members.some(canModify);
  const actionsFor = (member: WorkspaceMemberSummary) =>
    canModify(member) && (
      <MemberActions
        member={member}
        onAction={onAction}
        canTransfer={canTransferOwnership(actorRole, member.role)}
      />
    );

  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="px-5 text-muted-foreground">Member</TableHead>
              <TableHead className="px-5 text-muted-foreground">Role</TableHead>
              <TableHead className="px-5 text-muted-foreground">Joined</TableHead>
              {showActions && <TableHead className="px-3"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.user_id}>
                <TableCell className="w-full max-w-0 px-5 py-3">
                  <MemberIdentity member={member} isCurrentUser={member.user_id === currentUserId} />
                </TableCell>
                <TableCell className="px-5 py-3"><RoleBadge role={member.role} /></TableCell>
                <TableCell className="px-5 py-3 text-muted-foreground">{formatDate(member.joined_at)}</TableCell>
                {showActions && (
                  <TableCell className="px-3 py-1.5 text-right">
                    {actionsFor(member)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y sm:hidden">
        {members.map((member) => (
          <li key={member.user_id} className="flex items-start gap-2 px-5 py-3.5">
            <div className="min-w-0 flex-1 space-y-2">
              <MemberIdentity member={member} isCurrentUser={member.user_id === currentUserId} />
              <div className="flex flex-wrap items-center gap-2 pl-11 text-xs text-muted-foreground">
                <RoleBadge role={member.role} />
                <span>Joined {formatDate(member.joined_at)}</span>
              </div>
            </div>
            {actionsFor(member)}
          </li>
        ))}
      </ul>
    </>
  );
}
