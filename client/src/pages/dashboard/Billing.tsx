import {
    Check,
    CreditCard,
    Download,
    FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For small teams getting started with AI support.",
        features: [
            "100 AI conversations / month",
            "1 Knowledge Base",
            "2 Team Members",
            "Basic analytics",
        ],
    },
    {
        name: "Pro",
        price: "$49",
        description: "For growing teams that need more automation.",
        features: [
            "2,000 AI conversations / month",
            "10 Knowledge Bases",
            "10 Team Members",
            "Advanced analytics",
            "AI Assistant",
        ],
        current: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For organizations with advanced requirements.",
        features: [
            "Unlimited AI conversations",
            "Unlimited Knowledge Bases",
            "Unlimited Team Members",
            "Advanced analytics",
            "Priority support",
            "Custom integrations",
        ],
    },
];

const invoices = [
    {
        id: "INV-2026-001",
        date: "Aug 01, 2026",
        amount: "$49.00",
        status: "Paid",
    },
    {
        id: "INV-2026-002",
        date: "Jul 01, 2026",
        amount: "$49.00",
        status: "Paid",
    },
    {
        id: "INV-2026-003",
        date: "Jun 01, 2026",
        amount: "$49.00",
        status: "Paid",
    },
];

export default function Billing() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Billing
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your subscription, usage, and billing history.
                    </p>
                </div>
            </div>

            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Your organization's current subscription.
                            </p>
                        </div>

                        <Badge>Active</Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-6 rounded-lg border p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold">
                                    Pro
                                </h2>

                                <Badge variant="secondary">
                                    Current plan
                                </Badge>
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Everything you need to scale your customer
                                support.
                            </p>

                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-2xl font-semibold">
                                    $49
                                </span>

                                <span className="text-sm text-muted-foreground">
                                    / month
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline">
                                Change Plan
                            </Button>

                            <Button variant="destructive">
                                Cancel Plan
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage */}
            <div>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Current Usage
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Usage for the current billing period.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <UsageCard
                        title="AI Conversations"
                        used={1248}
                        limit={2000}
                    />

                    <UsageCard
                        title="Knowledge Base Storage"
                        used={3.2}
                        limit={10}
                        unit="GB"
                    />

                    <UsageCard
                        title="Team Members"
                        used={6}
                        limit={10}
                    />
                </div>
            </div>

            {/* Plans */}
            <div>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Plans
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Choose a plan that works best for your organization.
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={
                                plan.current
                                    ? "border-primary"
                                    : undefined
                            }
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{plan.name}</CardTitle>

                                    {plan.current && (
                                        <Badge>Current</Badge>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <span className="text-2xl font-semibold">
                                        {plan.price}
                                    </span>

                                    {plan.price !== "Custom" && (
                                        <span className="ml-1 text-sm text-muted-foreground">
                                            / month
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    {plan.description}
                                </p>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <div
                                            key={feature}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Check className="h-4 w-4 shrink-0" />

                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="mt-6 w-full"
                                    variant={
                                        plan.current
                                            ? "outline"
                                            : "default"
                                    }
                                    disabled={plan.current}
                                >
                                    {plan.current
                                        ? "Current Plan"
                                        : plan.name === "Enterprise"
                                          ? "Contact Sales"
                                          : "Upgrade"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>

                    <p className="text-sm text-muted-foreground">
                        Your default payment method for subscription billing.
                    </p>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                <CreditCard className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Visa ending in 4242
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Expires 08/28
                                </p>
                            </div>
                        </div>

                        <Button variant="outline">
                            Update
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>

                    <p className="text-sm text-muted-foreground">
                        View and download your previous invoices.
                    </p>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 font-medium">
                                        Invoice
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Date
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Amount
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Status
                                    </th>

                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />

                                                {invoice.id}
                                            </div>
                                        </td>

                                        <td className="py-4 text-muted-foreground">
                                            {invoice.date}
                                        </td>

                                        <td className="py-4 font-medium">
                                            {invoice.amount}
                                        </td>

                                        <td className="py-4">
                                            <Badge variant="secondary">
                                                {invoice.status}
                                            </Badge>
                                        </td>

                                        <td className="py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

type UsageCardProps = {
    title: string;
    used: number;
    limit: number;
    unit?: string;
};

function UsageCard({
    title,
    used,
    limit,
    unit = "",
}: UsageCardProps) {
    const percentage = Math.min((used / limit) * 100, 100);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                        {title}
                    </p>

                    <span className="text-xs text-muted-foreground">
                        {used}
                        {unit} / {limit}
                        {unit}
                    </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                    {Math.round(percentage)}% used
                </p>
            </CardContent>
        </Card>
    );
}