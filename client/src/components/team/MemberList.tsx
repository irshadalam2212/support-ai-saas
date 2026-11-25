import UserAvatar from "@/components/shared/UserAvatar";
import RoleBadge from "@/components/team/RoleBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WorkspaceMemberSummary } from "@/lib/fastapi.api";
import { formatDate } from "@/lib/format";

type MemberListProps = {
  members: WorkspaceMemberSummary[];
  currentUserId: string | undefined;
};

function MemberIdentity({ member, isCurrentUser }: { member: WorkspaceMemberSummary; isCurrentUser: boolean }) {
  const name = member.full_name || member.email || "Unnamed member";
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
export default function MemberList({ members, currentUserId }: MemberListProps) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="px-5 text-muted-foreground">Member</TableHead>
              <TableHead className="px-5 text-muted-foreground">Role</TableHead>
              <TableHead className="px-5 text-muted-foreground">Joined</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y sm:hidden">
        {members.map((member) => (
          <li key={member.user_id} className="space-y-2 px-5 py-3.5">
            <MemberIdentity member={member} isCurrentUser={member.user_id === currentUserId} />
            <div className="flex items-center gap-2 pl-11 text-xs text-muted-foreground">
              <RoleBadge role={member.role} />
              <span>Joined {formatDate(member.joined_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
