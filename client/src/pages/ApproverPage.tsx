import { useMemo, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Modal, StatusBadge } from "@/components/ui";
import { useDecideRequest, useRequests } from "@/hooks/useRequests";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RequestItem } from "@/types";

interface Decision {
  request: RequestItem;
  status: "approved" | "rejected";
}

export default function ApproverPage() {
  const { data = [], isLoading, error } = useRequests();
  const decide = useDecideRequest();
  const [decision, setDecision] = useState<Decision | null>(null);

  const pending = useMemo(() => data.filter((r) => r.status === "pending"), [data]);

  const columns = useMemo<ColumnDef<RequestItem, unknown>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "requesterName", header: "Requester" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setDecision({ request: row.original, status: "approved" })}
            >
              <CheckIcon className="h-4 w-4" /> Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setDecision({ request: row.original, status: "rejected" })}
            >
              <XMarkIcon className="h-4 w-4" /> Reject
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const confirm = async () => {
    if (!decision) return;
    await decide.mutateAsync({ id: decision.request.id, status: decision.status });
    setDecision(null);
  };

  return (
    <>
      <PageHeader title="Approvals" description="Review requests awaiting a decision." />

      <DataTable
        columns={columns}
        data={pending}
        isLoading={isLoading}
        error={error ? "Failed to load requests." : null}
        searchPlaceholder="Search pending requests..."
        emptyMessage="Nothing to review."
      />

      <Modal
        open={!!decision}
        onClose={() => setDecision(null)}
        title={decision?.status === "approved" ? "Approve request" : "Reject request"}
        description={decision?.request.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={decision?.status === "approved" ? "primary" : "danger"}
              isLoading={decide.isPending}
              onClick={confirm}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {decision
            ? `${decision.request.id} from ${decision.request.requesterName} for ${formatCurrency(
                decision.request.amount,
              )}.`
            : null}
        </p>
      </Modal>
    </>
  );
}
