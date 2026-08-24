import {
    Mail,
    MoreHorizontal,
    Plus,
    Shield,
    UserPlus,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const members = [
    {
        name: "John Smith",
        email: "john@acme.com",
        role: "Owner",
        status: "Active",
        joined: "Jan 12, 2026",
        initials: "JS",
    },
    {
        name: "Sarah Johnson",
        email: "sarah@acme.com",
        role: "Admin",
        status: "Active",
        joined: "Feb 04, 2026",
        initials: "SJ",
    },
    {
        name: "Michael Brown",
        email: "michael@acme.com",
        role: "Agent",
        status: "Active",
        joined: "Mar 18, 2026",
        initials: "MB",
    },
    {
        name: "Emily Davis",
        email: "emily@acme.com",
        role: "Agent",
        status: "Active",
        joined: "Apr 02, 2026",
        initials: "ED",
    },
    {
        name: "James Wilson",
        email: "james@acme.com",
        role: "Viewer",
        status: "Pending",
        joined: "Aug 20, 2026",
        initials: "JW",
    },
];

export default function TeamMembersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Users className="size-5 text-primary" />

                        <h1 className="text-2xl font-semibold tracking-tight">
                            Team Members
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your organization's users and access permissions.
                    </p>
                </div>

                <Button>
                    <UserPlus className="mr-2 size-4" />
                    Invite Member
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        Total Members
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        24
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Across your organization
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        Active Members
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        21
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                        87.5% of team
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">
                        Pending Invitations
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        3
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Awaiting acceptance
                    </p>
                </Card>
            </div>

            {/* Invite Card */}
            <Card className="p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Mail className="size-5" />
                    </div>

                    <div>
                        <h2 className="font-semibold">
                            Invite a Team Member
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Send an invitation to join your organization.
                        </p>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
                    <div className="space-y-2">
                        <Label htmlFor="invite-email">
                            Email Address
                        </Label>

                        <Input
                            id="invite-email"
                            type="email"
                            placeholder="colleague@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Role
                        </Label>

                        <select
                            defaultValue="AGENT"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="ADMIN">
                                Admin
                            </option>

                            <option value="AGENT">
                                Agent
                            </option>

                            <option value="VIEWER">
                                Viewer
                            </option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Send Invite
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Members Table */}
            <Card className="overflow-hidden">
                <div className="border-b p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Organization Members
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Users who have access to this organization.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30">
                                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                    Member
                                </th>

                                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                    Role
                                </th>

                                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                    Status
                                </th>

                                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                    Joined
                                </th>

                                <th className="w-10 px-4 py-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {members.map((member) => (
                                <tr
                                    key={member.email}
                                    className="border-b last:border-0 hover:bg-muted/20"
                                >
                                    {/* Member */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                {member.initials}
                                            </div>

                                            <div>
                                                <p className="font-medium">
                                                    {member.name}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="size-4 text-muted-foreground" />

                                            <Badge variant="outline">
                                                {member.role}
                                            </Badge>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        {member.status === "Active" ? (
                                            <Badge
                                                variant="secondary"
                                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                            >
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                                            >
                                                Pending
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Joined */}
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {member.joined}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}