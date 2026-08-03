import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Modal, Select, StatusBadge } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useCreateRequest, useRequests } from "@/hooks/useRequests";
import { requestSchema, type RequestValues } from "@/lib/schemas";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RequestItem } from "@/types";

export default function RequesterPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { data = [], isLoading, error } = useRequests();
  const createRequest = useCreateRequest(user?.name ?? "Unknown");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { title: "", category: "Hardware", amount: 0, notes: "" },
  });

  const columns = useMemo<ColumnDef<RequestItem, unknown>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  );

  const onSubmit = async (values: RequestValues) => {
    await createRequest.mutateAsync(values);
    reset();
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="My Requests"
        description="Submit and track approval requests."
        action={
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="h-4 w-4" /> New request
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error ? "Failed to load requests." : null}
        searchPlaceholder="Search requests..."
        emptyMessage="No requests yet."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New request"
        description="Requests start in pending status."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="request-form" isLoading={isSubmitting}>
              Submit
            </Button>
          </>
        }
      >
        <form id="request-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register("title")} />
          <Select label="Category" error={errors.category?.message} {...register("category")}>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Travel">Travel</option>
            <option value="Events">Events</option>
          </Select>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <Input
            label="Notes"
            hint="Optional"
            error={errors.notes?.message}
            {...register("notes")}
          />
        </form>
      </Modal>
    </>
  );
}
