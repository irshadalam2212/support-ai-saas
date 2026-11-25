import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import TextField from "@/components/auth/TextField";
import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createCustomer, updateCustomer, type Customer } from "@/lib/customers.api";
import { customerSchema, type CustomerFormValues } from "@/schemas/customer.schema";

type CustomerFormProps = {
  workspaceId: string;
  /** Null when adding a new customer. */
  customer: Customer | null;
  onSaved: (customer: Customer, added: boolean) => void;
  onCancel: () => void;
};

function CustomerForm({ workspaceId, customer, onSaved, onCancel }: CustomerFormProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      company: customer?.company ?? "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      customer
        ? updateCustomer(session!.access_token, workspaceId, customer.id, values)
        : createCustomer(session!.access_token, workspaceId, values),
    onSuccess: async (saved) => {
      onSaved(saved, customer === null);
      await queryClient.invalidateQueries({ queryKey: ["customers", workspaceId] });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      className="flex min-h-0 flex-1 flex-col"
      noValidate
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {saveMutation.isError && <Notice tone="error">{saveMutation.error.message}</Notice>}
        <TextField {...register("name")} id="customer-name" label="Name" autoComplete="off" error={errors.name?.message} />
        <TextField
          {...register("email")}
          id="customer-email"
          label="Email"
          type="email"
          autoComplete="off"
          error={errors.email?.message}
        />
        <TextField
          {...register("phone")}
          id="customer-phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="off"
          error={errors.phone?.message}
        />
        <TextField
          {...register("company")}
          id="customer-company"
          label="Company (optional)"
          autoComplete="off"
          error={errors.company?.message}
        />
      </div>
      <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending && <LoaderCircle aria-hidden="true" className="animate-spin" />}
          {customer ? "Save changes" : "Add customer"}
        </Button>
      </div>
    </form>
  );
}

type CustomerFormSheetProps = Omit<CustomerFormProps, "onCancel"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** The form is created afresh each time the panel opens. */
export default function CustomerFormSheet({ open, onOpenChange, ...formProps }: CustomerFormSheetProps) {
  const { customer } = formProps;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{customer ? "Edit customer" : "Add customer"}</SheetTitle>
          <SheetDescription>
            {customer ? "Update this customer's contact details." : "Add someone your team supports."}
          </SheetDescription>
        </SheetHeader>
        <CustomerForm key={customer?.id ?? "new"} {...formProps} onCancel={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
