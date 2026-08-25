import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Settings
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your organization's configuration and preferences.
                    </p>
                </div>

                <Button>
                    {/* <Save className="mr-2 size-4" /> */}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                {/* Settings Navigation */}
                <Card className="h-fit p-2">
                    <Link
                        to="/dashboard/settings"
                        className="flex w-full items-center gap-3 rounded-md bg-muted px-3 py-2.5 text-left text-sm font-medium"
                    >
                        General
                    </Link>

                    <Link
                        to="/dashboard/settings/assistant"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                        AI & Assistant
                    </Link>

                    <Link
                        to="/dashboard/settings/team"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                        Team Members
                    </Link>

                    <Link
                        to="/dashboard/settings/integrations"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                        Integrations
                    </Link>

                    <Link
                        to="/dashboard/settings/security"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                        Security
                    </Link>
                </Card>

                {/* General Settings */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <div>
                            <h2 className="font-semibold">
                                Organization Information
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Basic information about your organization.
                            </p>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="organization-name">
                                    Organization Name
                                </Label>

                                <Input
                                    id="organization-name"
                                    defaultValue="Acme Support"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    Organization Slug
                                </Label>

                                <Input
                                    id="slug"
                                    defaultValue="acme-support"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Support Email
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue="support@acme.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">
                                    Website
                                </Label>

                                <Input
                                    id="website"
                                    defaultValue="https://acme.com"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Description */}
                    <Card className="p-6">
                        <div>
                            <h2 className="font-semibold">
                                Organization Description
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                This information can be used as additional context for
                                your AI assistant.
                            </p>
                        </div>

                        <Separator className="my-6" />

                        <Textarea
                            defaultValue="Acme provides cloud-based productivity software for modern businesses."
                            className="min-h-32.5 resize-none"
                            placeholder="Describe your organization..."
                        />
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/30 p-6">
                        <div>
                            <h2 className="font-semibold text-destructive">
                                Danger Zone
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                These actions can permanently affect your organization.
                            </p>
                        </div>

                        <Separator className="my-6" />

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Delete Organization
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Permanently delete your organization and all associated
                                    data.
                                </p>
                            </div>

                            <Button variant="destructive">
                                Delete Organization
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}