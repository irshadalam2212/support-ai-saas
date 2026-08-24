import {
    Bot,
    Brain,
    MessageSquare,
    Save,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function AssistantSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Bot className="size-5 text-primary" />

                        <h1 className="text-2xl font-semibold tracking-tight">
                            AI & Assistant
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure how your AI assistant interacts with customers.
                    </p>
                </div>

                <Button>
                    <Save className="mr-2 size-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                {/* Settings Navigation */}
                <Card className="h-fit p-2">
                    <button className="flex w-full items-center gap-3 rounded-md bg-muted px-3 py-2.5 text-left text-sm font-medium">
                        <Bot className="size-4" />
                        AI & Assistant
                    </button>

                    <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted">
                        <Brain className="size-4" />
                        Knowledge & RAG
                    </button>

                    <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted">
                        <MessageSquare className="size-4" />
                        Conversation
                    </button>

                    <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted">
                        <ShieldAlert className="size-4" />
                        Safety & Handoff
                    </button>
                </Card>

                {/* Main Settings */}
                <div className="space-y-6">
                    {/* Assistant Identity */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Bot className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Assistant Identity
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Configure the name and basic behavior of your AI
                                    assistant.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="assistant-name">
                                    Assistant Name
                                </Label>

                                <Input
                                    id="assistant-name"
                                    defaultValue="Acme AI"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assistant-role">
                                    Assistant Role
                                </Label>

                                <Input
                                    id="assistant-role"
                                    defaultValue="Customer Support Assistant"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Model Configuration */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Sparkles className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Model Configuration
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Configure the language model used by your assistant.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="model">
                                    Model
                                </Label>

                                <Input
                                    id="model"
                                    defaultValue="gpt-4.1-mini"
                                    disabled
                                />

                                <p className="text-xs text-muted-foreground">
                                    Model selection will be available based on your
                                    subscription plan.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="temperature">
                                        Temperature
                                    </Label>

                                    <Input
                                        id="temperature"
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        defaultValue="0.3"
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Lower values produce more consistent responses.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max-tokens">
                                        Max Response Tokens
                                    </Label>

                                    <Input
                                        id="max-tokens"
                                        type="number"
                                        defaultValue="800"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* System Prompt */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Brain className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    System Instructions
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Define how your AI assistant should behave.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <Textarea
                            className="min-h-45 resize-none"
                            defaultValue={`You are Acme's customer support assistant.
                            Your job is to help customers with questions about Acme's products and services.

                            Always:
                            - Be helpful and professional.
                            - Use information from the organization's knowledge base.
                            - Do not invent information.
                            - If you are unsure, ask the customer for clarification.
                            - Escalate complex issues to a human support agent.`}
                        />

                        <p className="mt-2 text-xs text-muted-foreground">
                            These instructions are combined with retrieved knowledge
                            before sending the request to the LLM.
                        </p>
                    </Card>

                    {/* RAG */}
                    <Card className="p-6">
                        <div>
                            <h2 className="font-semibold">
                                Knowledge & RAG
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Control how your assistant uses your organization's
                                knowledge base.
                            </p>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Use Knowledge Base
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Allow the assistant to retrieve information from
                                        uploaded documents.
                                    </p>
                                </div>

                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Cite Sources
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Show customers which knowledge source was used.
                                    </p>
                                </div>

                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="top-k">
                                    Documents Retrieved
                                </Label>

                                <Input
                                    id="top-k"
                                    type="number"
                                    defaultValue="5"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Number of relevant document chunks retrieved for each
                                    question.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Human Handoff */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ShieldAlert className="size-5" />
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
                                        Enable Human Handoff
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Allow customers to request a human agent.
                                    </p>
                                </div>

                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Handoff on Low Confidence
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Automatically transfer conversations when the AI is
                                        uncertain.
                                    </p>
                                </div>

                                <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="confidence">
                                    Confidence Threshold
                                </Label>

                                <Input
                                    id="confidence"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    defaultValue="0.65"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Conversations below this confidence level can be
                                    escalated.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}