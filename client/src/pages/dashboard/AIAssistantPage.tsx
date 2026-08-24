import {
  Bot,
  ChevronDown,
  FileText,
  Info,
  Save,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              AI Assistant
            </h1>

            <Badge
              variant="secondary"
              className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure how your AI assistant behaves and responds to
            customers.
          </p>
        </div>

        <Button>
          <Save className="mr-2 size-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Settings */}
        <div className="space-y-6">
          {/* General */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="size-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  General Settings
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Configure your assistant's identity and basic behavior.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="assistant-name">
                  Assistant Name
                </Label>

                <Input
                  id="assistant-name"
                  defaultValue="Support AI"
                  placeholder="e.g. Support AI"
                />

                <p className="text-xs text-muted-foreground">
                  This name will be visible to your customers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-message">
                  Welcome Message
                </Label>

                <Textarea
                  id="welcome-message"
                  defaultValue="Hi! I'm your AI support assistant. How can I help you today?"
                  className="min-h-22.5 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* System Instructions */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  System Instructions
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Define the personality, rules and behavior of your AI.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="instructions">
                Instructions
              </Label>

              <Textarea
                id="instructions"
                defaultValue={`You are a helpful customer support assistant.
                Your responsibilities:
                - Answer customer questions clearly and professionally.
                - Use the provided knowledge base when answering questions.
                - Do not invent information.
                - If you are unsure about an answer, tell the customer and offer to connect them with a human agent.
                - Keep responses concise and friendly.`}
                className="min-h-55 resize-y font-mono text-sm"
              />

              <p className="text-xs text-muted-foreground">
                These instructions will be included when generating AI
                responses.
              </p>
            </div>
          </Card>

          {/* Model Settings */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Model Settings
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Configure the AI model used to generate responses.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>AI Model</Label>

                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm"
                >
                  <span>GPT-4.1 Mini</span>

                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">
                    Temperature
                  </Label>

                  <span className="text-sm font-medium">
                    0.3
                  </span>
                </div>

                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.3"
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More predictable</span>
                  <span>More creative</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Knowledge Base */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Knowledge Base
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select the knowledge sources available to your AI.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              {[
                "Product Documentation",
                "Pricing & Plans",
                "Customer Support Guide",
              ].map((document) => (
                <div
                  key={document}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {document}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Available for RAG
                      </p>
                    </div>
                  </div>

                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </Card>

          {/* Human Handoff */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="size-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Human Handoff
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Define when conversations should be transferred to a
                  human agent.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    Enable human handoff
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Allow customers to request a human agent.
                  </p>
                </div>

                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    Low confidence handoff
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Transfer conversations when AI confidence is low.
                  </p>
                </div>

                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/30 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />

                <h2 className="font-semibold">
                  Assistant Preview
                </h2>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                See how your assistant will appear to customers.
              </p>
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b p-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Support AI
                    </p>

                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Online
                    </div>
                  </div>
                </div>

                {/* Chat */}
                <div className="space-y-4 bg-muted/20 p-4">
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-background p-3 text-xs leading-relaxed shadow-sm">
                    Hi! I'm your AI support assistant. How can I help you
                    today?
                  </div>

                  <div className="ml-auto max-w-[75%] rounded-xl rounded-tr-sm bg-primary p-3 text-xs text-primary-foreground">
                    How do I reset my password?
                  </div>

                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-background p-3 text-xs leading-relaxed shadow-sm">
                    You can reset your password by clicking "Forgot
                    Password" on the login page. I'll guide you through
                    the process.
                  </div>
                </div>

                {/* Input */}
                <div className="border-t p-3">
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <span className="flex-1 text-xs text-muted-foreground">
                      Ask a question...
                    </span>

                    <Button
                      size="icon"
                      className="size-7"
                    >
                      <Sparkles className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your assistant uses the selected knowledge sources
                    to generate grounded responses.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}