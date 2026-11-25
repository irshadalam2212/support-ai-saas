import { AlertDialog } from "@base-ui/react/alert-dialog";
import { LoaderCircle } from "lucide-react";

import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  /** Keeps the dialog open and its buttons disabled while the action runs. */
  pending?: boolean;
  error?: string;
  destructive?: boolean;
};

/** Asks before an action that is hard to undo. Focus starts on "Cancel". */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
  error,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-popover p-5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-opacity outline-none data-ending-style:opacity-0 data-starting-style:opacity-0">
          <AlertDialog.Title className="text-base font-semibold break-words">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 break-words text-muted-foreground">
            {description}
          </AlertDialog.Description>
          {error && <Notice tone="error" className="mt-4">{error}</Notice>}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Close render={<Button variant="outline" disabled={pending} />}>Cancel</AlertDialog.Close>
            <Button variant={destructive ? "destructive" : "default"} disabled={pending} onClick={onConfirm}>
              {pending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
