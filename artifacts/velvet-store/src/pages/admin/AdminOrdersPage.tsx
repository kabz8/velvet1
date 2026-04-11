import { useState } from "react";
import { useListOrders, useUpdateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { formatKES } from "@/lib/utils";

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
  confirmed: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  processing: { bg: "rgba(168,85,247,0.15)", text: "#A855F7" },
  shipped: { bg: "rgba(14,165,233,0.15)", text: "#0EA5E9" },
  delivered: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
  cancelled: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
};

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, refetch } = useListOrders({ params: { status: statusFilter || undefined, page, limit: 20 }, request: { headers } } as any);
  const updateStatus = useUpdateOrder();

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateStatus.mutateAsync({ id: orderId, data: { status: status as any }, request: { headers } } as any);
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Orders</h1>
        <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>{data?.total || 0} total</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setStatusFilter("")} className="px-4 py-2 rounded-xl font-sans text-sm transition-all" style={{ background: !statusFilter ? "#6F2C91" : "rgba(255,255,255,0.05)", color: "#E7D9C8", border: "1px solid rgba(255,255,255,0.1)" }}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className="px-4 py-2 rounded-xl font-sans text-sm capitalize transition-all" style={{ background: statusFilter === s ? statusColors[s]?.bg : "rgba(255,255,255,0.05)", color: statusFilter === s ? statusColors[s]?.text : "#E7D9C8", border: "1px solid rgba(255,255,255,0.1)" }}>{s}</button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["Order #", "Customer", "Phone", "Total", "Status", "Date", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <>
                <tr key={order.id} className="border-b cursor-pointer hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <td className="px-4 py-4 font-sans text-sm font-medium" style={{ color: "#E7D9C8" }}>{order.orderNumber}</td>
                  <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{order.isAnonymous ? "🔒 Anon" : order.customerName || "—"}</td>
                  <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{order.customerPhone}</td>
                  <td className="px-4 py-4 font-sans text-sm font-semibold" style={{ color: "#C26D85" }}>{formatKES(order.total)}</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-full font-sans text-xs capitalize" style={{ background: statusColors[order.status]?.bg || "rgba(255,255,255,0.1)", color: statusColors[order.status]?.text || "#A1A1AA" }}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-sans text-xs" style={{ color: "#A1A1AA" }}>{new Date(order.createdAt).toLocaleDateString("en-KE")}</td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                      className="px-2 py-1.5 rounded-lg font-sans text-xs outline-none"
                      style={{ background: "#0B0B0F", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }}
                    >
                      {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr key={`${order.id}-detail`} style={{ background: "rgba(255,255,255,0.02)" }}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-sans text-xs uppercase mb-1" style={{ color: "#A1A1AA" }}>Delivery</p>
                          <p className="font-sans text-sm" style={{ color: "#E7D9C8" }}>{order.deliveryAddress}</p>
                          <p className="font-sans text-xs mt-0.5 capitalize" style={{ color: "#A1A1AA" }}>{order.deliveryRegion?.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="font-sans text-xs uppercase mb-1" style={{ color: "#A1A1AA" }}>Items</p>
                          {order.items?.map((item: any) => (
                            <p key={item.id} className="font-sans text-sm" style={{ color: "#E7D9C8" }}>{item.productTitle} × {item.quantity} — {formatKES(item.totalPrice)}</p>
                          ))}
                        </div>
                        <div>
                          <p className="font-sans text-xs uppercase mb-1" style={{ color: "#A1A1AA" }}>Payment</p>
                          <p className="font-sans text-sm capitalize" style={{ color: "#E7D9C8" }}>{order.paymentMethod?.replace("_", " ")}</p>
                          {order.notes && <p className="font-sans text-xs mt-2" style={{ color: "#A1A1AA" }}>Note: {order.notes}</p>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl font-sans text-sm disabled:opacity-40 transition-colors" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Previous</button>
          <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl font-sans text-sm disabled:opacity-40 transition-colors" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Next</button>
        </div>
      )}
    </div>
  );
}
