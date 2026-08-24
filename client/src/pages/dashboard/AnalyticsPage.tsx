import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Bot,
    CheckCircle2,
    Clock3,
    DollarSign,
    MessageSquare,
    Sparkles,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const stats = [
    {
        title: "Total Conversations",
        value: "12,842",
        change: "+18.2%",
        positive: true,
        description: "vs previous period",
        icon: MessageSquare,
    },
    {
        title: "AI Resolution Rate",
        value: "73.4%",
        change: "+4.8%",
        positive: true,
        description: "vs previous period",
        icon: Bot,
    },
    {
        title: "Avg. Response Time",
        value: "18.4s",
        change: "-12.5%",
        positive: true,
        description: "vs previous period",
        icon: Clock3,
    },
    {
        title: "Customer Satisfaction",
        value: "94.2%",
        change: "+2.1%",
        positive: true,
        description: "vs previous period",
        icon: Users,
    },
];

const chartData = [
    { day: "Mon", conversations: 420, resolved: 310 },
    { day: "Tue", conversations: 510, resolved: 382 },
    { day: "Wed", conversations: 470, resolved: 351 },
    { day: "Thu", conversations: 620, resolved: 465 },
    { day: "Fri", conversations: 710, resolved: 540 },
    { day: "Sat", conversations: 380, resolved: 290 },
    { day: "Sun", conversations: 340, resolved: 260 },
];

const topics = [
    {
        name: "Account & Login",
        conversations: 2840,
        percentage: 32,
    },
    {
        name: "Billing & Payments",
        conversations: 2180,
        percentage: 25,
    },
    {
        name: "Product Questions",
        conversations: 1760,
        percentage: 20,
    },
    {
        name: "Technical Support",
        conversations: 1240,
        percentage: 14,
    },
    {
        name: "Other",
        conversations: 860,
        percentage: 9,
    },
];

export default function AnalyticsPage() {
    const maxConversations = Math.max(
        ...chartData.map((item) => item.conversations),
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-primary" />

                        <h1 className="text-2xl font-semibold tracking-tight">
                            Analytics
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Understand how your AI support assistant is performing.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Select defaultValue="7days">
                        <SelectTrigger className="w-37.5">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="24hours">
                                Last 24 hours
                            </SelectItem>

                            <SelectItem value="7days">
                                Last 7 days
                            </SelectItem>

                            <SelectItem value="30days">
                                Last 30 days
                            </SelectItem>

                            <SelectItem value="90days">
                                Last 90 days
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline">
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.title} className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon className="size-5" />
                                </div>

                                <Badge
                                    variant="secondary"
                                    className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                >
                                    <ArrowUpRight className="size-3" />
                                    {stat.change}
                                </Badge>
                            </div>

                            <p className="mt-4 text-sm text-muted-foreground">
                                {stat.title}
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </Card>
                    );
                })}
            </div>

            {/* Conversation Chart */}
            <Card className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="font-semibold">
                            Conversation Activity
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Conversation volume and AI-resolved conversations.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary" />
                            Conversations
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-muted-foreground" />
                            AI Resolved
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex h-70 items-end gap-3 sm:gap-6">
                        {chartData.map((item) => {
                            const conversationHeight =
                                (item.conversations / maxConversations) * 100;

                            const resolvedHeight =
                                (item.resolved / maxConversations) * 100;

                            return (
                                <div
                                    key={item.day}
                                    className="flex h-full flex-1 flex-col justify-end"
                                >
                                    <div className="relative flex h-full items-end justify-center gap-1">
                                        <div
                                            className="w-3 rounded-t-md bg-primary transition-all sm:w-5"
                                            style={{
                                                height: `${conversationHeight}%`,
                                            }}
                                            title={`${item.conversations} conversations`}
                                        />

                                        <div
                                            className="w-3 rounded-t-md bg-muted-foreground/40 transition-all sm:w-5"
                                            style={{
                                                height: `${resolvedHeight}%`,
                                            }}
                                            title={`${item.resolved} resolved`}
                                        />
                                    </div>

                                    <p className="mt-3 text-center text-xs text-muted-foreground">
                                        {item.day}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* AI Performance */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="size-5" />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                AI Performance
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                How effectively your AI handles customer requests.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm">
                                    AI Resolution
                                </span>

                                <span className="text-sm font-medium">
                                    73.4%
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: "73.4%" }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm">
                                    First Response Accuracy
                                </span>

                                <span className="text-sm font-medium">
                                    91.8%
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: "91.8%" }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm">
                                    Human Handoff
                                </span>

                                <span className="text-sm font-medium">
                                    26.6%
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: "26.6%" }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Top Topics */}
                <Card className="p-6">
                    <div>
                        <h2 className="font-semibold">
                            Top Conversation Topics
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            What your customers are asking about.
                        </p>
                    </div>

                    <div className="mt-6 space-y-5">
                        {topics.map((topic) => (
                            <div key={topic.name}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm">
                                        {topic.name}
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        {topic.conversations.toLocaleString()} ·{" "}
                                        {topic.percentage}%
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary/70"
                                        style={{
                                            width: `${topic.percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Cost & Usage */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <DollarSign className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                AI Cost
                            </p>

                            <p className="text-xl font-semibold">
                                $84.32
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600">
                        <ArrowDownRight className="size-3" />
                        8.4% lower than last period
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Bot className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                AI Messages
                            </p>

                            <p className="text-xl font-semibold">
                                9,426
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                        73.4% of total conversations
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CheckCircle2 className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Resolved Conversations
                            </p>

                            <p className="text-xl font-semibold">
                                9,426
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                        Without human intervention
                    </div>
                </Card>
            </div>
        </div>
    );
}