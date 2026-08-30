import {
    Activity,
    ArrowUpRight,
    Bot,
    MessageSquare,
    Users,
    FileText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
    {
        title: "Total Conversations",
        value: "12,842",
        change: "+18.2%",
        icon: MessageSquare,
    },
    {
        title: "AI Resolutions",
        value: "9,421",
        change: "+24.5%",
        icon: Bot,
    },
    {
        title: "Knowledge Documents",
        value: "248",
        change: "+12",
        icon: FileText,
    },
    {
        title: "Active Customers",
        value: "4,821",
        change: "+8.4%",
        icon: Users,
    },
];

export default function OverviewPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Overview
                </h1>

                <p className="text-sm text-muted-foreground">
                    Monitor your AI support system and customer activity.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {

                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>

                                {/* <Icon className="size-4 text-muted-foreground" /> */}
                            </CardHeader>

                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>

                                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <ArrowUpRight className="size-3" />
                                    <span>{stat.change}</span>
                                    <span>from last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Conversation Activity</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Customer conversations over the last 30 days.
                                </p>
                            </div>

                            <Badge variant="secondary">
                                <Activity className="mr-1 size-3" />
                                Live
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed">
                            <div className="text-center">
                                <Activity className="mx-auto mb-3 size-8 text-muted-foreground" />

                                <p className="font-medium">Analytics Chart</p>

                                <p className="text-sm text-muted-foreground">
                                    We'll connect real analytics data later.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Resolution Rate</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Conversations resolved without an agent.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="text-5xl font-bold">73%</div>

                            <p className="mt-2 text-sm text-muted-foreground">
                                AI resolution rate
                            </p>

                            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div className="h-full w-[73%] rounded-full bg-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}