import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";

type UserAvatarProps = {
  name: string;
  className?: string;
};

/** Decorative: always show the person's name or email as text next to it. */
export default function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <Avatar aria-hidden="true" className={className}>
      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
