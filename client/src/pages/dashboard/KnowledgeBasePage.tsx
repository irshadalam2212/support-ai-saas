import {
  BookOpen,
  CheckCircle2,
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const documents = [
  {
    id: 1,
    name: "Product Documentation",
    type: "PDF",
    size: "2.4 MB",
    status: "Ready",
    chunks: 184,
    updated: "2 hours ago",
  },
  {
    id: 2,
    name: "Pricing & Plans",
    type: "PDF",
    size: "1.1 MB",
    status: "Ready",
    chunks: 92,
    updated: "Yesterday",
  },
  {
    id: 3,
    name: "Customer Support Guide",
    type: "DOCX",
    size: "856 KB",
    status: "Processing",
    chunks: 0,
    updated: "10 minutes ago",
  },
  {
    id: 4,
    name: "Frequently Asked Questions",
    type: "URL",
    size: "—",
    status: "Ready",
    chunks: 126,
    updated: "3 hours ago",
  },
];

const stats = [
  {
    title: "Total Documents",
    value: "248",
    description: "Across your knowledge base",
    icon: FileText,
  },
  {
    title: "Ready Documents",
    value: "241",
    description: "Available for AI responses",
    icon: CheckCircle2,
  },
  {
    title: "Knowledge Chunks",
    value: "18,492",
    description: "Indexed for AI search",
    icon: BookOpen,
  },
];

function getDocumentIcon(type: string) {
  if (type === "URL") {
    return Globe;
  }

  return FileText;
}

function getStatusBadge(status: string) {
  if (status === "Ready") {
    return (
      <Badge
        variant="secondary"
        className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
      >
        <CheckCircle2 className="size-3" />
        Ready
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-50"
    >
      <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
      Processing
    </Badge>
  );
}

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Knowledge Base
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the information your AI uses to answer customer questions.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Globe className="mr-2 size-4" />
            Add URL
          </Button>

          <Button>
            <Upload className="mr-2 size-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {stat.value}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Knowledge Base */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Knowledge Sources</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Documents and websites used by your AI assistant.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search documents..."
                  className="w-full pl-9 sm:w-64"
                />
              </div>

              <Button variant="outline">
                All Sources
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Header */}
          <div className="hidden border-b bg-muted/30 px-6 py-3 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[2fr_100px_120px_120px_40px] md:items-center md:gap-4">
            <span>Source</span>
            <span>Type</span>
            <span>Status</span>
            <span>Updated</span>
            <span />
          </div>

          {/* Documents */}
          <div className="divide-y">
            {documents.map((document) => {
              const Icon = getDocumentIcon(document.type);

              return (
                <div
                  key={document.id}
                  className="px-6 py-4 transition-colors hover:bg-muted/30"
                >
                  <div className="grid gap-4 md:grid-cols-[2fr_100px_120px_120px_40px] md:items-center md:gap-4">
                    {/* Source */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                        <Icon className="size-5 text-muted-foreground" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {document.name}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {document.type !== "URL" &&
                            `${document.size} · `}
                          {document.chunks > 0
                            ? `${document.chunks} chunks`
                            : "Preparing..."}
                        </p>
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <Badge variant="outline">
                        {document.type}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div>
                      {getStatusBadge(document.status)}
                    </div>

                    {/* Updated */}
                    <div className="text-sm text-muted-foreground">
                      {document.updated}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            View details
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            Re-index
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Delete source
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty footer */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing 4 of 248 knowledge sources
            </p>

            <Button variant="outline" size="sm">
              View all
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Knowledge CTA */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Plus className="size-6 text-primary" />
          </div>

          <h3 className="font-semibold">
            Add more knowledge
          </h3>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Upload product documentation, FAQs, guides or connect your
            website to help your AI assistant provide better answers.
          </p>

          <div className="mt-5 flex gap-2">
            <Button variant="outline">
              <Globe className="mr-2 size-4" />
              Add Website
            </Button>

            <Button>
              <Upload className="mr-2 size-4" />
              Upload File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}