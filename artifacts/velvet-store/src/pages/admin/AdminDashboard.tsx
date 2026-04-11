import { TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, DollarSign } from "lucide-react";
import { useGetDashboardStats, useListOrders } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { formatKES } from "@/lib/utils";
import { Link } from "wouter";

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
  confirmed: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  processing: { bg: "rgba(168,85,247,0.15)", text: "#A855F7" },
  shipped: { bg: "rgba(14,165,233,0.15)", text: "#0EA5E9" },
  delivered: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
  cancelled: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const { data: stats } = useGetDashboardStats({ request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined } } as any);
  const { data: ordersData } = useListOrders({ params: { limit: 5 }, request: { headers: token ? { Authorization: `Bearer ${token}` } : undefined } } as any);

  const recentOrders = ordersData?.orders || [];

  const cards = [
    { title: "Total Revenue", value: formatKES(stats?.totalRevenue || 0), icon: <DollarSign size={20} />, color: "#6F2C91", change: "+12%" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: <ShoppingCart size={20} />, color: "#C26D85", change: "+8%" },
    { title: "Total Products", value: stats?.totalProducts || 0, icon: <Package size={20} />, color: "#6F2C91", change: "" },
    { title: "Total Customers", value: stats?.totalCustomers || 0, icon: <Users size={20} />, color: "#C26D85", change: "+5%" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Dashboard</h1>
          <p className="font-sans text-sm mt-1" style={{ color: "#A1A1AA" }}>Welcome back! Here's what's happening.</p>
        </div>
        <Link href="/" target="_blank">
          <button className="px-4 py-2 rounded-xl font-sans text-sm flex items-center gap-2 hover:bg-white/5 transition-colors" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
            View Store <ArrowUpRight size={14} />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="p-5 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              {card.change && (
                <span className="font-sans text-xs flex items-center gap-1" style={{ color: "#22C55E" }}>
                  <TrendingUp size={12} />{card.change}
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-semibold" style={{ color: "#E7D9C8" }}>{card.value}</p>
            <p className="font-sans text-xs mt-1" style={{ color: "#A1A1AA" }}>{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      {stats?.ordersByStatus && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {Object.entries(stats.ordersByStatus as Record<string, number>).map(([status, count]) => (
            <div key={status} className="p-4 rounded-xl text-center" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{count}</p>
              <div className="inline-block mt-1 px-2 py-0.5 rounded-full font-sans text-xs capitalize" style={{ background: statusColors[status]?.bg || "rgba(255,255,255,0.1)", color: statusColors[status]?.text || "#A1A1AA" }}>
                {status}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>Recent Orders</h2>
          <Link href="/admin/orders">
            <button className="font-sans text-xs hover:text-white transition-colors" style={{ color: "#C26D85" }}>View All</button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {["Order", "Customer", "Items", "Total", "Status"].map(h => (
                  <th key={h} className="text-left px-6 py-3 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <td className="px-6 py-4 font-sans text-sm font-medium" style={{ color: "#E7D9C8" }}>{order.orderNumber}</td>
                  <td className="px-6 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{order.isAnonymous ? "Anonymous" : order.customerName || order.customerPhone}</td>
                  <td className="px-6 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{order.items?.length || 0} item(s)</td>
                  <td className="px-6 py-4 font-sans text-sm" style={{ color: "#C26D85" }}>{formatKES(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full font-sans text-xs capitalize" style={{ background: statusColors[order.status]?.bg || "rgba(255,255,255,0.1)", color: statusColors[order.status]?.text || "#A1A1AA" }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
