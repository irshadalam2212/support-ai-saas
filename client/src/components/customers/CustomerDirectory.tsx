import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, SearchX, Users } from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";
import CustomerFormSheet from "@/components/customers/CustomerFormSheet";
import CustomerList from "@/components/customers/CustomerList";
import { SORT_OPTIONS, useCustomerListParams } from "@/components/customers/useCustomerListParams";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "@/components/shared/Pagination";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteCustomer, listCustomers, type Customer } from "@/lib/customers.api";
import type { WorkspaceSummary } from "@/lib/fastapi.api";
import { canManageWorkspace } from "@/lib/roles";

const PAGE_SIZE = 25;

export default function CustomerDirectory({ workspace }: { workspace: WorkspaceSummary }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { q, sort, page, update, setQuery } = useCustomerListParams();
  const [successMessage, setSuccessMessage] = useState("");
  // Each target stays set while its panel closes, so the contents do not vanish.
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const customersQuery = useQuery({
    queryKey: ["customers", workspace.id, { q, sort, page }],
    queryFn: () => listCustomers(session!.access_token, workspace.id, { q, sort, page, pageSize: PAGE_SIZE }),
    enabled: Boolean(session?.access_token),
    placeholderData: keepPreviousData,
  });
  const data = customersQuery.data;

  // Deleting the last customer on a page, or an old link, can leave a page with nothing on it.
  const pastLastPage = data !== undefined && !customersQuery.isPlaceholderData && data.items.length === 0 && data.total > 0;
  const lastPage = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  useEffect(() => {
    if (pastLastPage) update({ page: lastPage });
  }, [pastLastPage, lastPage, update]);

  const deleteMutation = useMutation({
    mutationFn: (customer: Customer) => deleteCustomer(session!.access_token, workspace.id, customer.id),
    onSuccess: (_result, customer) => {
      setDeleteOpen(false);
      setSuccessMessage(`${customer.name} was deleted.`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["customers", workspace.id] }),
  });

  function openForm(customer: Customer | null) {
    setSuccessMessage("");
    setEditing(customer);
    setFormOpen(true);
  }

  function askToDelete(customer: Customer) {
    deleteMutation.reset();
    setSuccessMessage("");
    setDeleting(customer);
    setDeleteOpen(true);
  }

  const addButton = (
    <Button onClick={() => openForm(null)}>
      <Plus aria-hidden="true" />
      Add customer
    </Button>
  );

  function results() {
    if (customersQuery.isPending) return <LoadingState label="Loading customers" rows={5} className="p-5" />;
    if (customersQuery.isError) {
      return (
        <ErrorState
          title="Couldn't load customers"
          message={customersQuery.error.message}
          onRetry={() => void customersQuery.refetch()}
          retrying={customersQuery.isFetching}
        />
      );
    }
    if (customersQuery.data.total === 0) {
      return q.trim() ? (
        <EmptyState
          icon={SearchX}
          title="No matching customers"
          description={`Nothing matches “${q.trim()}”. Try part of a name, email, or company.`}
          action={<Button variant="outline" onClick={() => update({ q: "" })}>Show all customers</Button>}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add the people your team supports. Their support history will appear with them later."
          action={addButton}
        />
      );
    }
    return (
      <div aria-busy={customersQuery.isPlaceholderData} className={customersQuery.isPlaceholderData ? "opacity-60" : ""}>
        <CustomerList
          customers={customersQuery.data.items}
          onEdit={openForm}
          onDelete={canManageWorkspace(workspace.role) ? askToDelete : undefined}
        />
        <Pagination
          page={customersQuery.data.page}
          pageSize={PAGE_SIZE}
          total={customersQuery.data.total}
          onPageChange={(next) => update({ page: next })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description={`People ${workspace.name} supports.`} actions={addButton} />

      {successMessage && <Notice tone="success">{successMessage}</Notice>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={q} onChange={setQuery} label="Search customers" placeholder="Search name, email, or company" />
        <Select items={SORT_OPTIONS} value={sort} onValueChange={(value) => value && update({ sort: value })}>
          <SelectTrigger aria-label="Sort customers" className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {SORT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>{results()}</Card>

      <CustomerFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaceId={workspace.id}
        customer={editing}
        onSaved={(saved, added) => {
          setFormOpen(false);
          setSuccessMessage(added ? `${saved.name} was added.` : `${saved.name} was updated.`);
        }}
      />

      {deleting && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Delete ${deleting.name}?`}
          description="This removes the customer record permanently. Customers with tickets cannot be deleted."
          confirmLabel="Delete customer"
          destructive
          pending={deleteMutation.isPending}
          error={deleteMutation.error?.message}
          onConfirm={() => deleteMutation.mutate(deleting)}
        />
      )}
    </div>
  );
}
