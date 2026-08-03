import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useCreateUser, useToggleUser, useUsers } from "@/hooks/useUsers";
import { userSchema, type UserValues } from "@/lib/schemas";
import type { User } from "@/types";

export default function AdminPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const toggleUser = useToggleUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "requester" },
  });

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (row.original.active ? "Active" : "Disabled"),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant={row.original.active ? "danger" : "secondary"}
            onClick={() => toggleUser.mutate(row.original.id)}
          >
            {row.original.active ? "Disable" : "Enable"}
          </Button>
        ),
      },
    ],
    [toggleUser],
  );

  const onSubmit = async (values: UserValues) => {
    await createUser.mutateAsync(values);
    reset();
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Admin"
        description="Manage users and role assignments."
        action={
          <Button onClick={() => setOpen(true)}>
            <UserPlusIcon className="h-4 w-4" /> Add user
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error ? "Failed to load users." : null}
        searchPlaceholder="Search users..."
        emptyMessage="No users found."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form" isLoading={isSubmitting}>
              Create
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Select label="Role" error={errors.role?.message} {...register("role")}>
            <option value="requester">Requester</option>
            <option value="approver">Approver</option>
            <option value="admin">Admin</option>
          </Select>
        </form>
      </Modal>
    </>
  );
}
