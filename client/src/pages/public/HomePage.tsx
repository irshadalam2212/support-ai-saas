import { ArrowRight, BookOpen, Bot, ChartNoAxesCombined, Contact, Inbox, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router";

import Logo from "@/components/shared/Logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const currentFeatures = [
  {
    icon: ShieldCheck,
    title: "Workspace access",
    description: "Create workspaces and switch between them. Each one is visible only to its members.",
  },
  {
    icon: Users,
    title: "Team invitations",
    description: "Invite teammates, choose their role, and see who has access.",
  },
  {
    icon: Contact,
    title: "Customer records",
    description: "Keep the contact details of the people your team supports, and find them quickly.",
  },
];

const upcomingFeatures = [
  {
    icon: Inbox,
    title: "Support tickets",
    description: "Tickets, replies, internal notes, and assignments.",
  },
  {
    icon: BookOpen,
    title: "Knowledge base",
    description: "Private documents that answers can be based on, with their sources shown.",
  },
  {
    icon: Bot,
    title: "AI assistant",
    description: "Suggested answers drawn from your knowledge base, with hand-off to a person.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Analytics",
    description: "Ticket volume, resolution times, and feedback on AI answers.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="rounded-md"><Logo /></Link>
          <nav aria-label="Page sections" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="rounded-sm hover:text-foreground" href="#available">Available now</a>
            <a className="rounded-sm hover:text-foreground" href="#upcoming">Coming soon</a>
          </nav>
          <div className="flex items-center gap-2">
            {/* Very narrow phones rely on the "Sign in" button in the hero below. */}
            <Link to="/login" className={cn(buttonVariants({ variant: "ghost" }), "max-[359px]:hidden")}>
              Sign in
            </Link>
            <Link to="/signup" className={buttonVariants()}>Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge variant="accent">Customer support workspace</Badge>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                A thoughtful start for your support team.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                Set up a secure workspace, manage team access, and invite the people who support your customers.
                Ticketing, knowledge, and AI features are on the way.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className={buttonVariants({ size: "lg" })}>
                  Create a workspace
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link to="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  Sign in
                </Link>
              </div>
            </div>

            <Card id="available" className="scroll-mt-20 p-5 sm:p-6">
              <h2 className="font-semibold">Available now</h2>
              <p className="mt-0.5 text-muted-foreground">Workspaces, teams, and customers</p>
              <ul className="mt-5 space-y-3">
                {currentFeatures.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-3 rounded-lg border p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="mt-1 leading-5 text-muted-foreground">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section id="upcoming" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">Coming soon</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These are not available yet. Each will appear in your workspace when it is ready to use.
            </p>
          </div>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingFeatures.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Card className="h-full p-5">
                  <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 leading-6 text-muted-foreground">{description}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 SupportAI</span>
          <span>Workspace, team, and customer management are available now. Ticketing is in development.</span>
        </div>
      </footer>
    </div>
  );
}
