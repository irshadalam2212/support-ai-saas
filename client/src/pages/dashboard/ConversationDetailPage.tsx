import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  MoreHorizontal,
  Paperclip,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const messages = [
  {
    id: 1,
    sender: "customer",
    name: "Sarah Johnson",
    time: "10:32 AM",
    message:
      "Hi, I'm trying to reset my password but I haven't received the reset email yet.",
  },
  {
    id: 2,
    sender: "ai",
    name: "AI Assistant",
    time: "10:32 AM",
    message:
      "Hi Sarah! I'd be happy to help. Password reset emails can sometimes take a few minutes to arrive. Please check your spam or junk folder as well.",
  },
  {
    id: 3,
    sender: "customer",
    name: "Sarah Johnson",
    time: "10:34 AM",
    message:
      "I already checked my spam folder and there is nothing there. Can you send the reset email again?",
  },
  {
    id: 4,
    sender: "ai",
    name: "AI Assistant",
    time: "10:34 AM",
    message:
      "Absolutely. I've triggered another password reset email for your account. Please allow a few minutes for it to arrive.",
  },
  {
    id: 5,
    sender: "customer",
    name: "Sarah Johnson",
    time: "10:37 AM",
    message:
      "Great, I received it now. Thank you!",
  },
];

const sources = [
  {
    title: "Account Security Guide",
    type: "PDF",
    detail: "Page 12",
  },
  {
    title: "Password Reset FAQ",
    type: "PDF",
    detail: "Section 4",
  },
];

export default function ConversationDetailPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">
                Unable to reset my password
              </h1>

              <Badge
                variant="secondary"
                className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50"
              >
                <Clock3 className="size-3" />
                Open
              </Badge>

              <Badge
                variant="outline"
                className="border-red-200 text-red-600"
              >
                High Priority
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Conversation #CON-10284 · Started today at 10:32 AM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <CheckCircle2 className="mr-2 size-4" />
            Resolve
          </Button>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Conversation */}
        <Card className="flex min-h-0 flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                SJ
              </div>

              <div>
                <p className="text-sm font-medium">
                  Sarah Johnson
                </p>

                <p className="text-xs text-muted-foreground">
                  sarah@example.com
                </p>
              </div>
            </div>

            <Badge variant="outline" className="gap-1">
              <Bot className="size-3" />
              AI Handling
            </Badge>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
            {messages.map((message) => {
              const isCustomer = message.sender === "customer";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isCustomer ? "justify-start" : "justify-end"
                  }`}
                >
                  {!isCustomer && (
                    <div className="order-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="size-4" />
                    </div>
                  )}

                  {isCustomer && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      SJ
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] ${
                      isCustomer ? "" : "order-1"
                    }`}
                  >
                    <div
                      className={`mb-1 flex items-center gap-2 ${
                        isCustomer ? "" : "justify-end"
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {message.name}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {message.time}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isCustomer
                          ? "rounded-tl-sm bg-muted"
                          : "rounded-tr-sm bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.message}
                    </div>

                    {!isCustomer && (
                      <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                        <Check className="size-3" />
                        AI response
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t p-4">
            <div className="rounded-xl border bg-background">
              <Textarea
                placeholder="Reply to Sarah..."
                className="min-h-22.5 resize-none border-0 shadow-none focus-visible:ring-0"
              />

              <div className="flex items-center justify-between border-t px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                  >
                    <Paperclip className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Sparkles className="size-4" />
                    AI Suggest
                  </Button>
                </div>

                <Button size="sm">
                  <Send className="mr-2 size-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="min-h-0 space-y-4 overflow-y-auto">
          {/* Customer */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Customer
              </h2>

              <Button
                variant="ghost"
                size="icon"
                className="size-8"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                SJ
              </div>

              <div>
                <p className="text-sm font-medium">
                  Sarah Johnson
                </p>

                <p className="text-xs text-muted-foreground">
                  sarah@example.com
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Conversations
                </span>

                <span className="font-medium">
                  12
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Customer since
                </span>

                <span className="font-medium">
                  Jan 2026
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Plan
                </span>

                <Badge variant="outline">
                  Pro
                </Badge>
              </div>
            </div>
          </Card>

          {/* Conversation Details */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold">
              Conversation Details
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50"
                  >
                    <Clock3 className="size-3" />
                    Open
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Priority
                </p>

                <p className="mt-1 text-sm font-medium text-red-600">
                  High
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Assigned to
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Bot className="size-4 text-primary" />

                  <span className="text-sm">
                    AI Assistant
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Created
                </p>

                <p className="mt-1 text-sm">
                  Aug 24, 2026 · 10:32 AM
                </p>
              </div>
            </div>
          </Card>

          {/* RAG Sources */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />

              <h2 className="text-sm font-semibold">
                AI Sources
              </h2>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Knowledge used to generate the AI response.
            </p>

            <div className="mt-4 space-y-2">
              {sources.map((source) => (
                <div
                  key={source.title}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {source.title}
                    </p>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {source.type} · {source.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Handoff */}
          <Card className="border-dashed p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <UserRound className="size-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Human Handoff
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Take over this conversation if the AI cannot
                  confidently resolve the customer's issue.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Take over conversation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}