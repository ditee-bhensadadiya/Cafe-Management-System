import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import { orderApi } from "../../api/orders";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import { TableRowSkeleton } from "../../components/Skeletons";
import { formatCurrency } from "../../utils/format";
import { exportToCsv } from "../../utils/csv";

const STATUS_OPTIONS = ["pending", "accepted", "preparing", "ready", "completed", "cancelled"];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", search, status, page],
    queryFn: () => orderApi.listAll({ search: search || undefined, status: status || undefined, page, page_size: 10 }),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => orderApi.updateStatus(id, newStatus),
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleExport = () => {
    exportToCsv(
      "orders.csv",
      (data?.items || []).map((o) => ({
        order_number: o.order_number,
        customer: o.customer_name,
        status: o.status,
        total: o.total_amount,
      }))
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Orders</h1>
        <button onClick={handleExport} className="btn-ghost !px-4 !py-2 text-sm">
          <HiOutlineArrowDownTray /> Export CSV
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search order # or customer…"
          className="input-field sm:w-72"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field sm:w-48">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-secondary/20 text-espresso/50 dark:text-cream/40">
            <tr>
              <th className="p-4">Order #</th><th className="p-4">Customer</th><th className="p-4">Total</th>
              <th className="p-4">Status</th><th className="p-4">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
            ) : (
              (data?.items || []).map((o) => (
                <tr key={o.id}>
                  <td className="p-4 font-medium">{o.order_number}</td>
                  <td className="p-4">{o.customer_name}</td>
                  <td className="p-4">{formatCurrency(o.total_amount)}</td>
                  <td className="p-4"><StatusBadge status={o.status} /></td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => statusMutation.mutate({ id: o.id, newStatus: e.target.value })}
                      className="input-field !py-1.5 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
    </div>
  );
}
