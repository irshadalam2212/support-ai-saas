import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type SettingsSectionProps = {
  id?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <Card id={id}>
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-0.5 text-muted-foreground">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}
