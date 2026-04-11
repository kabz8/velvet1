import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/utils";

export default function AdminBannersPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data: banners = [], refetch } = useListBanners({ params: {} });
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", ctaLabel: "", ctaLink: "", isActive: true, sortOrder: 0 });

  const openCreate = () => { setForm({ title: "", subtitle: "", imageUrl: "", ctaLabel: "", ctaLink: "", isActive: true, sortOrder: banners.length }); setEditId(null); setShowForm(true); };
  const openEdit = (b: any) => { setForm({ title: b.title, subtitle: b.subtitle || "", imageUrl: b.imageUrl || "", ctaLabel: b.ctaLabel || "", ctaLink: b.ctaLink || "", isActive: b.isActive, sortOrder: b.sortOrder }); setEditId(b.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateBanner.mutateAsync({ id: editId, data: form, request: { headers } } as any);
      } else {
        await createBanner.mutateAsync({ ...form, request: { headers } } as any);
      }
      setShowForm(false);
      refetch();
    } catch { alert("Failed to save banner"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner.mutateAsync({ id, request: { headers } } as any);
    refetch();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Banners</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((b: any) => (
          <div key={b.id} className="flex gap-4 p-5 rounded-2xl items-center" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <img src={getImageUrl(b.imageUrl)} alt={b.title} className="w-24 h-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-semibold" style={{ color: "#E7D9C8" }}>{b.title}</h3>
              {b.subtitle && <p className="font-sans text-xs mt-0.5 truncate" style={{ color: "#A1A1AA" }}>{b.subtitle}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full font-sans text-xs" style={{ background: b.isActive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: b.isActive ? "#22C55E" : "#A1A1AA" }}>{b.isActive ? "Active" : "Inactive"}</span>
                <span className="font-sans text-xs" style={{ color: "#A1A1AA" }}>Order: {b.sortOrder}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#A1A1AA" }}><Pencil size={14} /></button>
              <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#A1A1AA" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl my-8" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{editId ? "Edit Banner" : "Add Banner"}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#A1A1AA" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[["Title *", "title", "text"], ["Subtitle", "subtitle", "text"], ["Image URL", "imageUrl", "text"], ["CTA Label", "ctaLabel", "text"], ["CTA Link", "ctaLink", "text"]].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>{label}</label>
                  <input type={type} required={key === "title"} className={inputCls} style={inputStyle} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Sort Order</label>
                <input type="number" className={inputCls} style={inputStyle} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: +e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-sans text-sm" style={{ color: "#E7D9C8" }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-purple-600" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-sans text-sm" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-sans font-semibold text-sm" style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>{editId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
