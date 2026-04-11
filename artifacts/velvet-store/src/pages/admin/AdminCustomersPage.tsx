import { useListCustomers } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { formatKES } from "@/lib/utils";
import { useState } from "react";

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const [page, setPage] = useState(1);
  const { data } = useListCustomers({ params: { page, limit: 20 }, request: { headers } } as any);
  const customers = data?.customers || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Customers</h1>
        <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>{data?.total || 0} total</span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["Name", "Phone", "Orders", "Total Spent", "Last Order"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-4 font-sans text-sm font-medium" style={{ color: "#E7D9C8" }}>{c.name || "Anonymous"}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{c.phone}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{c.orderCount || 0}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#C26D85" }}>{formatKES(c.totalSpent || 0)}</td>
                <td className="px-4 py-4 font-sans text-xs" style={{ color: "#A1A1AA" }}>{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("en-KE") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl font-sans text-sm disabled:opacity-40" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Previous</button>
          <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl font-sans text-sm disabled:opacity-40" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Next</button>
        </div>
      )}
    </div>
  );
}
