import { BarChart3, BookOpen, Bot, LayoutDashboard, MessageSquare, Settings, Users, type LucideIcon } from "lucide-react";
import { Link, Outlet } from "react-router";

type NavItem = {
    label: string;
    path: string;
    icon: LucideIcon;
};

const workspaceItems: NavItem[] = [
    {
        label: "Overview",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Conversations",
        path: "/dashboard/conversations",
        icon: MessageSquare,
    },
    {
        label: "Knowledge Base",
        path: "/dashboard/knowledge-base",
        icon: BookOpen,
    },
    {
        label: "AI Assistant",
        path: "/dashboard/assistant",
        icon: Bot,
    },
    {
        label: "Analytics",
        path: "/dashboard/analytics",
        icon: BarChart3,
    },
    {
        label: "Customers",
        path: "/dashboard/customers",
        icon: Users,
    },
    {
        label: "Settings",
        path: "/dashboard/settings",
        icon: Settings,
    },
];

export default function OrganizationLayout() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <aside className="hidden w-64 border-r bg-background lg:block">
                <div className="flex h-16 items-center border-b px-6">
                    <div>
                        <h1 className="text-lg font-semibold">Support AI</h1>
                        <p className="text-xs text-muted-foreground">
                            AI Support Platform
                        </p>
                    </div>
                </div>

                <nav className="space-y-1 p-4">
                    <p className="mb-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                        Workspace
                    </p>

                    {workspaceItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                                <Icon className="size-4" />

                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <p className="mb-2 mt-6 px-3 text-xs font-medium uppercase text-muted-foreground">
                        Management
                    </p>

                    {["Integrations", "Settings", "Billing"].map((item) => (
                        <button
                            key={item}
                            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-background px-6">
                    <div>
                        <h2 className="font-semibold">ABC Technologies</h2>
                        <p className="text-xs text-muted-foreground">
                            Organisation workspace
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">John Smith</p>
                            <p className="text-xs text-muted-foreground">
                                Organisation Admin
                            </p>
                        </div>

                        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            JS
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}