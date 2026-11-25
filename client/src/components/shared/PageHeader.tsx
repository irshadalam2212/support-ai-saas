import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm break-words text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
