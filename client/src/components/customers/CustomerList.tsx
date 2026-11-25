import { Ellipsis, Pencil, Trash2 } from "lucide-react";

import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/lib/customers.api";
import { formatDate } from "@/lib/format";

type CustomerHandlers = {
  onEdit: (customer: Customer) => void;
  /** Omit when the signed-in user may not delete customers. */
  onDelete?: (customer: Customer) => void;
};

function CustomerIdentity({ customer, onEdit }: { customer: Customer } & Pick<CustomerHandlers, "onEdit">) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={customer.name} />
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => onEdit(customer)}
          className="block max-w-full truncate rounded-sm text-left font-medium hover:underline pointer-coarse:-my-2 pointer-coarse:py-3"
          title={customer.name}
        >
          {customer.name}
        </button>
        {customer.company && <p className="truncate text-xs text-muted-foreground">{customer.company}</p>}
      </div>
    </div>
  );
}

function CustomerActions({ customer, onEdit, onDelete }: { customer: Customer } & CustomerHandlers) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} aria-label={`Actions for ${customer.name}`}>
        <Ellipsis aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2 px-2 py-2 pointer-coarse:py-3" onClick={() => onEdit(customer)}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        {onDelete && (
          <DropdownMenuItem
            variant="destructive"
            className="gap-2 px-2 py-2 pointer-coarse:py-3"
            onClick={() => onDelete(customer)}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const emailLink = "rounded-sm hover:text-primary hover:underline";

/** A table on wider screens and a stacked list on smaller ones. */
export default function CustomerList({ customers, ...handlers }: { customers: Customer[] } & CustomerHandlers) {
  return (
    <>
      <div className="hidden md:block">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[32%] px-5 text-muted-foreground">Name</TableHead>
              <TableHead className="w-[32%] px-3 text-muted-foreground">Email</TableHead>
              <TableHead className="px-3 text-muted-foreground">Phone</TableHead>
              <TableHead className="w-32 px-3 text-muted-foreground">Added</TableHead>
              <TableHead className="w-16 px-3"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="px-5 py-3">
                  <CustomerIdentity customer={customer} onEdit={handlers.onEdit} />
                </TableCell>
                <TableCell className="truncate px-3 py-3">
                  <a href={`mailto:${customer.email}`} className={emailLink} title={customer.email}>
                    {customer.email}
                  </a>
                </TableCell>
                <TableCell className="truncate px-3 py-3 text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                <TableCell className="px-3 py-3 text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
                <TableCell className="px-3 py-1.5 text-right">
                  <CustomerActions customer={customer} {...handlers} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y md:hidden">
        {customers.map((customer) => (
          <li key={customer.id} className="flex items-start gap-2 px-5 py-3.5">
            <div className="min-w-0 flex-1 space-y-1.5">
              <CustomerIdentity customer={customer} onEdit={handlers.onEdit} />
              <div className="space-y-0.5 pl-11 text-xs text-muted-foreground">
                <p className="truncate">{customer.email}</p>
                {customer.phone && <p className="truncate">{customer.phone}</p>}
                <p>Added {formatDate(customer.created_at)}</p>
              </div>
            </div>
            <CustomerActions customer={customer} {...handlers} />
          </li>
        ))}
      </ul>
    </>
  );
}
