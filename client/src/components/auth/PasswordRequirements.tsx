import { Check, Circle } from "lucide-react";

import { passwordRules } from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";

/** A live checklist of the rules the password schema enforces. */
export default function PasswordRequirements({ id, password }: { id: string; password: string }) {
  return (
    <ul id={id} aria-label="Password requirements" className="grid gap-1.5 sm:grid-cols-2">
      {passwordRules.map(({ label, pattern }) => {
        const met = pattern.test(password);
        return (
          <li key={label} className={cn("flex items-center gap-1.5 text-xs", met ? "text-success" : "text-muted-foreground")}>
            {met
              ? <Check aria-hidden="true" className="size-3.5" />
              : <Circle aria-hidden="true" className="mx-0.5 size-2.5" />}
            {label}
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
