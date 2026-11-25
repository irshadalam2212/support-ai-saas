import { ArrowRight, BookOpen, Bot, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const currentFeatures = [
  {
    icon: ShieldCheck,
    title: "Workspace access",
    description: "Create and switch between workspaces with membership-scoped access.",
  },
  {
    icon: Users,
    title: "Team invitations",
    description: "Manage workspace members, assign supported roles, and invite teammates.",
  },
];

const plannedFeatures = [
  {
    icon: MessageSquare,
    title: "Customer support workflows",
    description: "Workspace-scoped customers, tickets, messages, and assignments.",
    phase: "Phase 4",
  },
  {
    icon: BookOpen,
    title: "Knowledge and grounded AI",
    description: "Private knowledge sources, retrieval, citations, and AI assistance.",
    phase: "Phases 5–7",
  },
  {
    icon: Bot,
    title: "Analytics and automation",
    description: "Support metrics, AI feedback, usage tracking, and workflow automation.",
    phase: "Phases 7–8",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="/" className="text-lg font-bold tracking-tight">SupportAI</a>
          <nav aria-label="Page navigation" className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a className="hover:text-foreground" href="#available">Available now</a>
            <a className="hover:text-foreground" href="#roadmap">Roadmap</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>Sign in</Button>
            <Button onClick={() => navigate("/signup")}>Get started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b bg-muted/20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge variant="outline">Customer support workspace</Badge>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                A thoughtful start for your support team.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                Set up a secure workspace, manage team access, and invite the people who support your customers. Ticketing, knowledge, and AI features are being built in stages.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate("/signup")}>
                  Create a workspace <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Sign in
                </Button>
              </div>
            </div>

            <Card className="space-y-5 p-6 sm:p-8">
              <div>
                <p className="text-sm font-medium">Available now</p>
                <p className="mt-1 text-sm text-muted-foreground">Workspace and team management</p>
              </div>
              <div className="space-y-3">
                {currentFeatures.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-3 rounded-lg border p-4">
                    <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <h2 className="text-sm font-semibold">{title}</h2>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="available" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">Built in roadmap phases</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The dashboard shows only features connected to their backend. These planned areas will become available as their APIs are completed.
            </p>
          </div>
          <div id="roadmap" className="mt-7 grid gap-4 md:grid-cols-3">
            {plannedFeatures.map(({ icon: Icon, title, description, phase }) => (
              <Card key={title} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                  <Badge variant="secondary">{phase}</Badge>
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>SupportAI</span>
          <span>Workspace and team management are available now; support workflows are in development.</span>
        </div>
      </footer>
    </div>
  );
}
