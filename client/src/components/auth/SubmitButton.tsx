import { ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  pending: boolean;
  label: string;
  pendingLabel: string;
  disabled?: boolean;
};

export default function SubmitButton({ pending, label, pendingLabel, disabled = false }: SubmitButtonProps) {
  return (
    <Button type="submit" className="h-11 w-full" disabled={pending || disabled}>
      {pending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
      {pending ? pendingLabel : label}
      {!pending && <ArrowRight aria-hidden="true" />}
    </Button>
  );
}
