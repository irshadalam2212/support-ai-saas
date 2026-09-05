import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  FileText,
  // Github,
  LineChart,
  MessageSquare,
  Play,
  Search,
  Send,
  Sparkles,
  Ticket,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Support Assistant",
    description:
      "Give your customers instant answers using an AI assistant trained on your company's knowledge.",
  },
  {
    icon: FileText,
    title: "Knowledge Base",
    description:
      "Upload documents, guides, FAQs and product documentation to create a powerful knowledge source.",
  },
  {
    icon: Ticket,
    title: "Ticket Automation",
    description:
      "Automatically classify, prioritize and summarize support tickets with AI.",
  },
  {
    icon: LineChart,
    title: "Support Analytics",
    description:
      "Understand your support performance with AI resolution, response time and customer insights.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect your knowledge",
    description:
      "Upload PDFs, documentation, FAQs and other company knowledge.",
  },
  {
    number: "02",
    title: "AI learns your business",
    description:
      "Our RAG-powered AI retrieves the most relevant information for every question.",
  },
  {
    number: "03",
    title: "Resolve support faster",
    description:
      "Customers get accurate answers while agents focus on complex problems.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <Hero />

        <TrustedCompanies />

        <Features />

        <HowItWorks />

        <AIDemo />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Navbar                                                                     */
/* -------------------------------------------------------------------------- */

function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            SupportAI
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Product
            <ChevronDown className="h-3.5 w-3.5" />
          </a>

          <a
            href="#solutions"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Solutions
            <ChevronDown className="h-3.5 w-3.5" />
          </a>

          <a
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>

          <a
            href="#resources"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Resources
            <ChevronDown className="h-3.5 w-3.5" />
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            onClick={() => navigate("/login")}
          >
            Sign in
          </Button>

          <Button
            className="rounded-lg"
            onClick={() => navigate("signup")}
          >
            Get started
            {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
          </Button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-10 lg:grid-cols-2 lg:px-8">
        {/* Left */}
        <div>
          <Badge
            variant="secondary"
            className="mb-6 rounded-full border px-4 py-1.5"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI-powered customer support
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your knowledge.
            <br />

            <span className="text-primary">
              Your AI support team.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Turn your documentation into an intelligent support assistant.
            Resolve tickets faster, reduce support costs, and delight your
            customers with instant answers.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-lg px-6" onClick={() => navigate("signup")}>
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-lg px-6"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch demo
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              No credit card required
            </div>

            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              14-day free trial
            </div>
          </div>
        </div>

        {/* Right - AI Chat */}
        <HeroChat />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero Chat                                                                  */
/* -------------------------------------------------------------------------- */

function HeroChat() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />

      <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
        {/* Window header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold">SupportAI</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">
                  AI Assistant
                </span>
              </div>
            </div>
          </div>

          <Badge variant="secondary">AI</Badge>
        </div>

        {/* Messages */}
        <div className="space-y-5 p-5">
          {/* User */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
              How can I change my subscription plan?
            </div>
          </div>

          {/* AI */}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-6">
                You can change your subscription plan from{" "}
                <strong>Settings → Billing → Subscription</strong>.
                <br />
                <br />
                You can upgrade or downgrade your plan at any time.
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Sources
                </p>

                <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                  <FileText className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-xs font-medium">
                      Billing Guide
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Page 12
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                  <FileText className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-xs font-medium">
                      Subscription Documentation
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Page 4
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-2">
            <input
              placeholder="Ask a question..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />

            <Button size="icon" className="h-9 w-9 rounded-lg">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Trusted Companies                                                           */
/* -------------------------------------------------------------------------- */

function TrustedCompanies() {
  const companies = [
    "stripe",
    "vercel",
    "Linear",
    "Notion",
    "slack",
  ];

  return (
    <section className="border-y bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Trusted by modern teams
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <span
              key={company}
              className="text-lg font-semibold tracking-tight text-muted-foreground/70"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Features                                                                    */
/* -------------------------------------------------------------------------- */

function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full">
            <Zap className="mr-2 h-3.5 w-3.5" />
            Powerful AI support
          </Badge>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your support team needs
          </h2>

          <p className="mt-4 text-muted-foreground">
            One intelligent platform to automate support, empower agents,
            and turn your company's knowledge into answers.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-5 font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How It Works                                                                */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <section
      id="solutions"
      className="border-y bg-muted/20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <Badge variant="secondary" className="rounded-full">
              Simple setup
            </Badge>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Turn your knowledge into an AI support team
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              Connect your existing documentation and let SupportAI handle
              repetitive customer questions while your team focuses on
              high-value conversations.
            </p>

            <div className="mt-10 space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-semibold">{step.title}</h3>

                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <Card className="overflow-hidden rounded-2xl shadow-xl">
              <div className="border-b p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      Knowledge Base
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your AI's source of truth
                    </p>
                  </div>

                  <Button size="sm">
                    Upload document
                  </Button>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-lg border px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm text-muted-foreground">
                    Search documents...
                  </span>
                </div>
              </div>

              <div className="divide-y">
                {[
                  ["Billing Guide", "PDF", "36 chunks"],
                  ["Getting Started", "PDF", "42 chunks"],
                  ["API Documentation", "URL", "128 chunks"],
                  ["Refund Policy", "PDF", "18 chunks"],
                  ["Account Management", "DOCX", "31 chunks"],
                ].map(([name, type, chunks]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {type} · {chunks}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      Indexed
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* AI Demo                                                                     */
/* -------------------------------------------------------------------------- */

function AIDemo() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full">
            <MessageSquare className="mr-2 h-3.5 w-3.5" />
            Built for intelligent conversations
          </Badge>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            AI that knows your business
          </h2>

          <p className="mt-4 text-muted-foreground">
            SupportAI combines your knowledge base with powerful language
            models to deliver accurate, contextual answers.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <Card className="overflow-hidden rounded-2xl shadow-2xl">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="font-semibold">AI Support Assistant</p>
                  <p className="text-xs text-muted-foreground">
                    Powered by your knowledge base
                  </p>
                </div>
              </div>

              <Badge variant="secondary">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                Online
              </Badge>
            </div>

            {/* Chat */}
            <div className="space-y-6 bg-muted/20 p-6 sm:p-8">
              <div className="flex justify-end">
                <div className="max-w-lg rounded-2xl rounded-br-sm bg-primary px-5 py-3 text-sm text-primary-foreground">
                  What is your refund policy for annual subscriptions?
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>

                <div className="max-w-2xl rounded-2xl rounded-tl-sm border bg-background px-5 py-4 text-sm leading-7 shadow-sm">
                  Annual subscriptions are eligible for a refund within
                  30 days of the original purchase. Refund requests can
                  be submitted through the Billing section of your
                  account.
                </div>
              </div>

              <div className="ml-12">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Answer generated from
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <FileText className="mr-1.5 h-3 w-3" />
                    Refund Policy
                  </Badge>

                  <Badge variant="outline">
                    <FileText className="mr-1.5 h-3 w-3" />
                    Billing Guide
                  </Badge>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2 rounded-xl border p-2">
                <input
                  placeholder="Ask anything about your product..."
                  className="flex-1 bg-transparent px-3 text-sm outline-none"
                />

                <Button size="icon" className="rounded-lg">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                   */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="px-6 pb-24 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-primary-foreground sm:px-12 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Sparkles className="mx-auto h-8 w-8" />

          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Build a smarter support experience
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
            Turn your company's knowledge into an AI-powered support
            experience your customers will love.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-lg px-6"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-lg border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>

              <span className="font-bold">SupportAI</span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              AI-powered customer support for modern teams.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Button size="icon" variant="ghost">
                {/* <Github className="h-4 w-4" /> */}
                Github
              </Button>
            </div>
          </div>

          <FooterColumn
            title="Product"
            links={[
              "AI Assistant",
              "Knowledge Base",
              "Ticket Automation",
              "Analytics",
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              "About",
              "Careers",
              "Contact",
              "Blog",
            ]}
          />

          <FooterColumn
            title="Resources"
            links={[
              "Documentation",
              "API Reference",
              "Help Center",
              "Status",
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SupportAI. All rights reserved.</p>

          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>

            <a href="#" className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer Column                                                              */
/* -------------------------------------------------------------------------- */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}