import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useListCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { formatKES } from "@/lib/utils";

export default function AdminCouponsPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data: coupons = [], refetch } = useListCoupons({ request: { headers } } as any);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: "", discountType: "percentage" as "percentage" | "fixed", discountValue: 0, minimumOrderAmount: 0, usageLimit: undefined as number | undefined, expiresAt: "", isActive: true });

  const openCreate = () => { setForm({ code: "", discountType: "percentage", discountValue: 0, minimumOrderAmount: 0, usageLimit: undefined, expiresAt: "", isActive: true }); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => { setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minimumOrderAmount: c.minimumOrderAmount || 0, usageLimit: c.usageLimit, expiresAt: c.expiresAt?.split("T")[0] || "", isActive: c.isActive }); setEditId(c.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, expiresAt: form.expiresAt || undefined };
    try {
      if (editId) {
        await updateCoupon.mutateAsync({ id: editId, data: payload, request: { headers } } as any);
      } else {
        await createCoupon.mutateAsync({ ...payload, request: { headers } } as any);
      }
      setShowForm(false);
      refetch();
    } catch { alert("Failed to save coupon"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteCoupon.mutateAsync({ id, request: { headers } } as any);
    refetch();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Coupons</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["Code", "Type", "Value", "Min Order", "Usage", "Expires", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c: any) => (
              <tr key={c.id} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-4 font-sans text-sm font-bold" style={{ color: "#C26D85", fontFamily: "monospace" }}>{c.code}</td>
                <td className="px-4 py-4 font-sans text-sm capitalize" style={{ color: "#A1A1AA" }}>{c.discountType}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#E7D9C8" }}>{c.discountType === "percentage" ? `${c.discountValue}%` : formatKES(c.discountValue)}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{c.minimumOrderAmount ? formatKES(c.minimumOrderAmount) : "—"}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="px-4 py-4 font-sans text-sm" style={{ color: "#A1A1AA" }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-KE") : "Never"}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-0.5 rounded-full font-sans text-xs" style={{ background: c.isActive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: c.isActive ? "#22C55E" : "#A1A1AA" }}>{c.isActive ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#A1A1AA" }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#A1A1AA" }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{editId ? "Edit Coupon" : "Add Coupon"}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#A1A1AA" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Code *</label>
                <input required className={inputCls} style={inputStyle} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="VELVET10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Type</label>
                  <select className={inputCls} style={inputStyle} value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))}>
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed KES</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Value *</label>
                  <input type="number" required className={inputCls} style={inputStyle} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: +e.target.value }))} />
                </div>
                <div>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Min Order (KES)</label>
                  <input type="number" className={inputCls} style={inputStyle} value={form.minimumOrderAmount} onChange={e => setForm(f => ({ ...f, minimumOrderAmount: +e.target.value }))} />
                </div>
                <div>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Usage Limit</label>
                  <input type="number" className={inputCls} style={inputStyle} value={form.usageLimit || ""} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value ? +e.target.value : undefined }))} placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Expires</label>
                  <input type="date" className={inputCls} style={inputStyle} value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-sans text-sm" style={{ color: "#E7D9C8" }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-purple-600" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-sans text-sm" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-sans font-semibold text-sm" style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
