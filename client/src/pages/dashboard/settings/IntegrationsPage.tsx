import {
  CheckCircle2,
  ExternalLink,
  Globe,
  KeyRound,
  Mail,
  MessageSquare,
  Plus,
  Save,
  Settings,
  Webhook,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const integrations = [
  {
    name: "OpenAI",
    description: "Power your AI assistant with OpenAI models.",
    icon: Globe,
    connected: true,
  },
  {
    name: "Slack",
    description: "Send support notifications and alerts to Slack.",
    icon: MessageSquare,
    connected: false,
  },
  {
    name: "Email",
    description: "Send customer notifications and support emails.",
    icon: Mail,
    connected: true,
  },
  {
    name: "Webhooks",
    description: "Send events from your workspace to external services.",
    icon: Webhook,
    connected: false,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Integrations
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Connect your workspace with external services.
          </p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;

          return (
            <Card
              key={integration.name}
              className="p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      {integration.name}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>

                {integration.connected ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="mr-1 size-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Not Connected
                  </Badge>
                )}
              </div>

              <div className="mt-5">
                {integration.connected ? (
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="mr-2 size-4" />
                    Configure
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="mr-2 size-4" />
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* OpenAI Configuration */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              AI Provider
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure the API credentials used by your AI assistant.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="provider">
              Provider
            </Label>

            <select
              id="provider"
              defaultValue="openai"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="openai">
                OpenAI
              </option>

              <option value="anthropic">
                Anthropic
              </option>

              <option value="google">
                Google Gemini
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">
              API Key
            </Label>

            <Input
              id="api-key"
              type="password"
              defaultValue="sk-************************"
            />

            <p className="text-xs text-muted-foreground">
              Your API key is encrypted before being stored.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-url">
              Base URL
            </Label>

            <Input
              id="base-url"
              defaultValue="https://api.openai.com/v1"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>
            <Save className="mr-2 size-4" />
            Save Provider
          </Button>
        </div>
      </Card>

      {/* Email Integration */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Email Notifications
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Configure email notifications for your support team.
              </p>
            </div>
          </div>

          <Switch defaultChecked />
        </div>

        <Separator className="my-6" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from-name">
              Sender Name
            </Label>

            <Input
              id="from-name"
              defaultValue="Acme Support"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-email">
              Sender Email
            </Label>

            <Input
              id="from-email"
              type="email"
              defaultValue="support@acme.com"
            />
          </div>
        </div>
      </Card>

      {/* Webhooks */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              Webhooks
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Send real-time events from your organization to external
              applications.
            </p>
          </div>

          <Button variant="outline">
            <Plus className="mr-2 size-4" />
            Add Webhook
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="rounded-lg border border-dashed p-8 text-center">
          <Webhook className="mx-auto size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            No webhooks configured
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Add a webhook to receive events from your workspace.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <Plus className="mr-2 size-4" />
            Create Webhook
          </Button>
        </div>
      </Card>

      {/* API Access */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              API Access
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Allow external applications to access your organization.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Organization API
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Create API keys for server-to-server integrations.
            </p>
          </div>

          <Button variant="outline">
            <KeyRound className="mr-2 size-4" />
            Manage API Keys
          </Button>
        </div>
      </Card>

      {/* Documentation */}
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">
            Integration Documentation
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Learn how to connect your application with Support AI.
          </p>
        </div>

        <Button variant="outline">
          View Documentation
          <ExternalLink className="ml-2 size-4" />
        </Button>
      </Card>
    </div>
  );
}