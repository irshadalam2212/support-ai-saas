import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const customers = [
  {
    id: "CUS-1024",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    company: "Acme Inc.",
    plan: "Pro",
    conversations: 12,
    lastActive: "Today, 10:37 AM",
    status: "Active",
  },
  {
    id: "CUS-1023",
    name: "Michael Brown",
    email: "michael@example.com",
    company: "Bright Labs",
    plan: "Business",
    conversations: 28,
    lastActive: "Today, 09:14 AM",
    status: "Active",
  },
  {
    id: "CUS-1022",
    name: "Emily Davis",
    email: "emily@example.com",
    company: "Nova Systems",
    plan: "Pro",
    conversations: 8,
    lastActive: "Yesterday",
    status: "Active",
  },
  {
    id: "CUS-1021",
    name: "James Wilson",
    email: "james@example.com",
    company: "Wilson & Co.",
    plan: "Starter",
    conversations: 4,
    lastActive: "Yesterday",
    status: "Inactive",
  },
  {
    id: "CUS-1020",
    name: "Olivia Martinez",
    email: "olivia@example.com",
    company: "Orbit Studio",
    plan: "Business",
    conversations: 21,
    lastActive: "Aug 22, 2026",
    status: "Active",
  },
  {
    id: "CUS-1019",
    name: "Daniel Anderson",
    email: "daniel@example.com",
    company: "Anderson Tech",
    plan: "Pro",
    conversations: 16,
    lastActive: "Aug 21, 2026",
    status: "Active",
  },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {/* <Users className="size-5 text-primary" /> */}

            <h1 className="text-2xl font-semibold tracking-tight">
              Customers
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage customers and view their support activity.
          </p>
        </div>

        <Button>
          {/* <UserPlus className="mr-2 size-4" /> */}
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Total Customers
          </p>

          <p className="mt-2 text-2xl font-semibold">
            2,486
          </p>

          <p className="mt-1 text-xs text-emerald-600">
            +12.4% this month
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Active Customers
          </p>

          <p className="mt-2 text-2xl font-semibold">
            2,104
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            84.6% of total customers
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            New This Month
          </p>

          <p className="mt-2 text-2xl font-semibold">
            184
          </p>

          <p className="mt-1 text-xs text-emerald-600">
            +8.7% from last month
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Avg. Conversations
          </p>

          <p className="mt-2 text-2xl font-semibold">
            5.2
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            per customer
          </p>
        </Card>
      </div>

      {/* Customer Table */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search customers..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Customers
                </SelectItem>

                <SelectItem value="active">
                  Active
                </SelectItem>

                <SelectItem value="inactive">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-plans">
              <SelectTrigger className="w-32.5">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all-plans">
                  All Plans
                </SelectItem>

                <SelectItem value="starter">
                  Starter
                </SelectItem>

                <SelectItem value="pro">
                  Pro
                </SelectItem>

                <SelectItem value="business">
                  Business
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Customer
                </th>

                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Company
                </th>

                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Plan
                </th>

                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  <button className="flex items-center gap-1">
                    Conversations
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>

                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Last Active
                </th>

                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>

                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-muted/20"
                >
                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {customer.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>

                      <div>
                        <p className="font-medium">
                          {customer.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-6 py-4 text-muted-foreground">
                    {customer.company}
                  </td>

                  {/* Plan */}
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {customer.plan}
                    </Badge>
                  </td>

                  {/* Conversations */}
                  <td className="px-6 py-4 font-medium">
                    {customer.conversations}
                  </td>

                  {/* Last Active */}
                  <td className="px-6 py-4 text-muted-foreground">
                    {customer.lastActive}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {customer.status === "Active" ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Inactive
                      </Badge>
                    )}
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Showing 1–6 of 2,486 customers
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}