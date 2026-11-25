const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function getMemberName(member: { full_name: string | null; email: string | null }) {
  return member.full_name || member.email || "Unnamed member";
}

export function getInitials(name: string) {
  const words = name.split("@")[0].split(/[\s._-]+/).filter(Boolean);
  const initials = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? name).slice(0, 2);
  return initials.toUpperCase();
}
