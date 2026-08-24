import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Lock,
  Monitor,
  Save,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const sessions = [
  {
    device: "Chrome on Windows",
    location: "Mumbai, India",
    ip: "103.XX.XX.42",
    lastActive: "Active now",
    current: true,
  },
  {
    device: "Chrome on Android",
    location: "Mumbai, India",
    ip: "103.XX.XX.18",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    device: "Safari on iPhone",
    location: "Mumbai, India",
    ip: "49.XX.XX.91",
    lastActive: "Yesterday",
    current: false,
  },
];

const auditLogs = [
  {
    action: "User invited",
    user: "john@acme.com",
    time: "10 minutes ago",
  },
  {
    action: "API key created",
    user: "sarah@acme.com",
    time: "2 hours ago",
  },
  {
    action: "Assistant settings updated",
    user: "john@acme.com",
    time: "Yesterday",
  },
  {
    action: "Password changed",
    user: "michael@acme.com",
    time: "2 days ago",
  },
];

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Security
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage authentication, access control, sessions, and security
            settings.
          </p>
        </div>

        <Button>
          <Save className="mr-2 size-4" />
          Save Changes
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Security Status
            </p>

            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>

          <p className="mt-2 text-lg font-semibold text-emerald-600">
            Good
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            No critical issues detected
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Active Sessions
            </p>

            <Monitor className="size-4 text-muted-foreground" />
          </div>

          <p className="mt-2 text-lg font-semibold">
            3
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Across your organization
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              2FA Enabled
            </p>

            <ShieldCheck className="size-4 text-muted-foreground" />
          </div>

          <p className="mt-2 text-lg font-semibold">
            18 / 24
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Team members
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              API Keys
            </p>

            <KeyRound className="size-4 text-muted-foreground" />
          </div>

          <p className="mt-2 text-lg font-semibold">
            4
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Active keys
          </p>
        </Card>
      </div>

      {/* Authentication */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              Authentication
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure authentication requirements for your organization.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                Require Two-Factor Authentication
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Require all team members to use 2FA when signing in.
              </p>
            </div>

            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                Session Timeout
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Automatically sign users out after a period of inactivity.
              </p>
            </div>

            <select
              defaultValue="24"
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="1">1 hour</option>
              <option value="8">8 hours</option>
              <option value="24">24 hours</option>
              <option value="168">7 days</option>
            </select>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                Password Authentication
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Allow users to sign in using email and password.
              </p>
            </div>

            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card className="p-6">
        <div>
          <h2 className="font-semibold">
            Change Password
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Update your account password.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current-password">
              Current Password
            </Label>

            <Input
              id="current-password"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">
              New Password
            </Label>

            <Input
              id="new-password"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirm Password
            </Label>

            <Input
              id="confirm-password"
              type="password"
            />
          </div>
        </div>

        <div className="mt-5">
          <Button variant="outline">
            Update Password
          </Button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Monitor className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Active Sessions
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Devices currently signed in to your account.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          {sessions.map((session, index) => (
            <div
              key={session.ip}
              className={`flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${
                index !== sessions.length - 1
                  ? "border-b"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <Monitor className="size-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {session.device}
                    </p>

                    {session.current && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      >
                        Current
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {session.location} · {session.ip}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Last active
                  </p>

                  <p className="text-sm">
                    {session.lastActive}
                  </p>
                </div>

                {!session.current && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <Button variant="outline">
            Sign Out All Other Sessions
          </Button>
        </div>
      </Card>

      {/* API Security */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              API Security
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure security policies for API access.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                API Rate Limiting
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Protect your API from excessive requests.
              </p>
            </div>

            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requests">
                Requests per Minute
              </Label>

              <Input
                id="requests"
                type="number"
                defaultValue="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="burst">
                Burst Limit
              </Label>

              <Input
                id="burst"
                type="number"
                defaultValue="20"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock3 className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Recent Audit Activity
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Security-related activity in your organization.
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <Separator />

        <div>
          {auditLogs.map((log, index) => (
            <div
              key={`${log.action}-${index}`}
              className={`flex items-center justify-between px-6 py-4 ${
                index !== auditLogs.length - 1
                  ? "border-b"
                  : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {log.action}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Performed by {log.user}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                {log.time}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50/40 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-amber-600" />

          <div>
            <p className="text-sm font-medium">
              Security recommendation
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Enable two-factor authentication for all organization
              administrators and regularly review active sessions and API
              keys.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}