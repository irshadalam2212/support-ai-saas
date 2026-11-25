import {
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { WorkspaceRole } from "@/lib/roles";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Omit to show the item to every role. */
  roles?: WorkspaceRole[];
  isActive: (pathname: string) => boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

const STAFF: WorkspaceRole[] = ["OWNER", "ADMIN", "AGENT"];
const MANAGERS: WorkspaceRole[] = ["OWNER", "ADMIN"];

const within = (path: string) => (pathname: string) => pathname === path || pathname.startsWith(`${path}/`);

function item(label: string, path: string, icon: LucideIcon, roles?: WorkspaceRole[]): NavItem {
  return { label, path, icon, roles, isActive: within(path) };
}

const groups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { ...item("Overview", "/overview", LayoutDashboard), isActive: (pathname) => pathname === "/overview" },
      item("Customers", "/customers", Users, STAFF),
      // Team members is a tab inside Settings.
      item("Settings", "/settings", Settings),
    ],
  },
  {
    label: "Coming soon",
    items: [
      item("Conversations", "/conversations", Inbox, STAFF),
      item("Knowledge base", "/knowledge-base", BookOpen, STAFF),
      item("AI assistant", "/assistant", Bot, STAFF),
      item("Analytics", "/analytics", ChartNoAxesCombined, STAFF),
      item("Billing", "/billing", CreditCard, MANAGERS),
    ],
  },
];

/** Navigation visible to a role. Hiding items is a convenience only; the API enforces access. */
export function getNavigation(role: WorkspaceRole | undefined): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((entry) => !entry.roles || (role !== undefined && entry.roles.includes(role))),
    }))
    .filter((group) => group.items.length > 0);
}
