import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { orderApi } from "../api/orders";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { TableRowSkeleton } from "../components/Skeletons";
import { formatCurrency } from "../utils/format";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyOrders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", status, page],
    queryFn: () => orderApi.myOrders({ status: status || undefined, page, page_size: 8 }),
    keepPreviousData: true,
  });

  const orders = data?.items || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">My Orders</h1>
      <p className="mt-2 text-espresso/60 dark:text-cream/60">Track the status of your past and current orders.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              status === f.value
                ? "border-primary bg-primary text-cream"
                : "border-secondary/40 text-espresso/70 hover:bg-primary/5 dark:text-cream/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <table className="w-full">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={4} />
              ))}
            </tbody>
          </table>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            subtitle="Once you place an order, it'll show up here."
            action={<Link to="/menu" className="btn-primary">Browse the menu</Link>}
          />
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold">{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-espresso/60 dark:text-cream/50">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {order.items.map((i) => i.product_name).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-lg font-semibold text-primary dark:text-secondary">
                  {formatCurrency(order.total_amount)}
                </span>
                <Link to={`/order-success/${order.id}`} className="btn-ghost !px-4 !py-2 text-sm">
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
    </div>
  );
}
