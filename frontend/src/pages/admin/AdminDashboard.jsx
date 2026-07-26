import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dashboardApi } from "../../api/admin";
import { formatCurrency } from "../../utils/format";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: dashboardApi.admin });
  const cards = data?.cards;

  if (isLoading) return <p className="text-espresso/50">Loading dashboard…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={cards?.total_users} />
        <StatCard label="Today's Sales" value={formatCurrency(cards?.todays_sales)} />
        <StatCard label="Monthly Revenue" value={formatCurrency(cards?.monthly_revenue)} />
        <StatCard label="Best Seller" value={cards?.best_selling_product || "—"} />
        <StatCard label="Pending Orders" value={cards?.pending_orders} accent="text-amber-600" />
        <StatCard label="Completed Orders" value={cards?.completed_orders} accent="text-green-600" />
        <StatCard label="Cancelled Orders" value={cards?.cancelled_orders} accent="text-red-500" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Revenue (last 7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenue_chart || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6F4E37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#C8A97E30" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#6F4E37" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Orders (last 7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.orders_chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C8A97E30" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#D2691E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">Sales trend (last 30 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.sales_chart || []}>
              <defs>
                <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D2691E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D2691E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#C8A97E30" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#D2691E" fill="url(#sales)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-espresso/40 dark:text-cream/40">{label}</p>
      <p className={`mt-1.5 font-display text-xl font-semibold ${accent || "text-primary dark:text-secondary"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}
