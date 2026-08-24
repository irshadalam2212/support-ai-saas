import {
    MoreHorizontal,
    Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";

const conversations = [
    {
        id: "1",
        customer: "Sarah Johnson",
        email: "sarah@example.com",
        subject: "Unable to reset my password",
        preview: "I tried resetting my password but I haven't received...",
        status: "Open",
        priority: "High",
        source: "AI",
        time: "2 min ago",
        initials: "SJ",
    },
    {
        id: "2",
        customer: "Michael Brown",
        email: "michael@example.com",
        subject: "Question about pricing",
        preview: "Could you explain the difference between Pro and...",
        status: "Open",
        priority: "Medium",
        source: "AI",
        time: "12 min ago",
        initials: "MB",
    },
    {
        id: "3",
        customer: "Emily Davis",
        email: "emily@example.com",
        subject: "How can I export my data?",
        preview: "I need to export all my customer data as a CSV file.",
        status: "Resolved",
        priority: "Low",
        source: "AI",
        time: "34 min ago",
        initials: "ED",
    },
    {
        id: "4",
        customer: "James Wilson",
        email: "james@example.com",
        subject: "Payment failed",
        preview: "My payment failed and now my account is showing...",
        status: "Open",
        priority: "High",
        source: "Human",
        time: "1 hour ago",
        initials: "JW",
    },
    {
        id: "5",
        customer: "Olivia Taylor",
        email: "olivia@example.com",
        subject: "Account cancellation",
        preview: "I would like to cancel my subscription.",
        status: "Resolved",
        priority: "Medium",
        source: "Human",
        time: "2 hours ago",
        initials: "OT",
    },
];

function getStatusBadge(status: string) {
    if (status === "Resolved") {
        return (
            <Badge
                variant="secondary"
                className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
            >
                {/* <CheckCircle2 className="size-3" /> */}
                Resolved
            </Badge>
        );
    }

    return (
        <Badge
            variant="secondary"
            className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50"
        >
            {/* <Clock3 className="size-3" /> */}
            Open
        </Badge>
    );
}

function getPriorityBadge(priority: string) {
    if (priority === "High") {
        return (
            <Badge variant="outline" className="border-red-200 text-red-600">
                High
            </Badge>
        );
    }

    if (priority === "Medium") {
        return (
            <Badge variant="outline" className="border-amber-200 text-amber-600">
                Medium
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="text-muted-foreground">
            Low
        </Badge>
    );
}

export default function ConversationsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Conversations
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage and review conversations between customers and your AI
                        assistant.
                    </p>
                </div>

                <Button>
                    AI Assistant
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        Total Conversations
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        12,842
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                        +18.2% from last month
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        Open
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        184
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Need attention
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        AI Resolved
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        73%
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                        +4.2% from last month
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        Avg. Response Time
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                        18 sec
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                        -12% from last month
                    </p>
                </Card>
            </div>

            {/* Conversation List */}
            <Card className="overflow-hidden">
                {/* Filters */}
                <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            placeholder="Search conversations..."
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline">
                            All
                        </Button>

                        <Button variant="outline">
                            Open
                        </Button>

                        <Button variant="outline">
                            Resolved
                        </Button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="hidden grid-cols-[2fr_2fr_100px_100px_100px_40px] gap-4 border-b bg-muted/30 px-6 py-3 text-xs font-medium text-muted-foreground lg:grid">
                    <span>Customer</span>
                    <span>Conversation</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Source</span>
                    <span />
                </div>

                {/* Conversations */}
                <div className="divide-y">
                    {conversations.map((conversation) => (
                        <Link
                            key={conversation.id}
                            to={`/dashboard/conversations/${conversation.id}`}
                            className="block px-6 py-4 transition-colors hover:bg-muted/30"
                        >
                            <div className="grid gap-4 lg:grid-cols-[2fr_2fr_100px_100px_100px_40px] lg:items-center lg:gap-4">
                                {/* Customer */}
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                        {conversation.initials}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium">
                                                {conversation.customer}
                                            </p>
                                        </div>

                                        <p className="truncate text-xs text-muted-foreground">
                                            {conversation.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Conversation */}
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {conversation.subject}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                        {conversation.preview}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {conversation.time}
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    {getStatusBadge(conversation.status)}
                                </div>

                                {/* Priority */}
                                <div>
                                    {getPriorityBadge(conversation.priority)}
                                </div>

                                {/* Source */}
                                <div>
                                    {conversation.source === "AI" ? (
                                        <Badge variant="outline" className="gap-1">
                                            AI
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="gap-1">
                                            Human
                                        </Badge>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        Showing 5 of 12,842 conversations
                    </p>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            Previous
                        </Button>

                        <Button variant="outline" size="sm">
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}