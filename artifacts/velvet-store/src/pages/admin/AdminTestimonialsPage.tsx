import { useState } from "react";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";
import { useListTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminTestimonialsPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data: testimonials = [], refetch } = useListTestimonials();
  const createT = useCreateTestimonial();
  const updateT = useUpdateTestimonial();
  const deleteT = useDeleteTestimonial();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ customerAlias: "", content: "", rating: 5, isApproved: true });

  const openCreate = () => { setForm({ customerAlias: "", content: "", rating: 5, isApproved: true }); setEditId(null); setShowForm(true); };
  const openEdit = (t: any) => { setForm({ customerAlias: t.customerAlias, content: t.content, rating: t.rating, isApproved: t.isApproved }); setEditId(t.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateT.mutateAsync({ id: editId, data: form, request: { headers } } as any);
      } else {
        await createT.mutateAsync({ ...form, request: { headers } } as any);
      }
      setShowForm(false);
      refetch();
    } catch { alert("Failed to save testimonial"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    await deleteT.mutateAsync({ id, request: { headers } } as any);
    refetch();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Testimonials</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <div key={t.id} className="p-5 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} fill="#C26D85" style={{ color: "#C26D85" }} />)}
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-full font-sans text-xs" style={{ background: t.isApproved ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: t.isApproved ? "#22C55E" : "#A1A1AA" }}>{t.isApproved ? "Approved" : "Pending"}</span>
                <button onClick={() => openEdit(t)} className="p-1 hover:bg-white/5 rounded" style={{ color: "#A1A1AA" }}><Pencil size={12} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-red-500/10 rounded" style={{ color: "#A1A1AA" }}><Trash2 size={12} /></button>
              </div>
            </div>
            <p className="font-sans text-sm mb-3" style={{ color: "#A1A1AA" }}>"{t.content}"</p>
            <p className="font-sans text-xs font-semibold" style={{ color: "#E7D9C8" }}>— {t.customerAlias}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{editId ? "Edit" : "Add"} Testimonial</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#A1A1AA" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Customer Name/Alias *</label>
                <input required className={inputCls} style={inputStyle} value={form.customerAlias} onChange={e => setForm(f => ({ ...f, customerAlias: e.target.value }))} placeholder="J. Smith or just initials" />
              </div>
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Review *</label>
                <textarea required rows={4} className={inputCls} style={inputStyle} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, rating: r }))}>
                      <Star size={20} fill={r <= form.rating ? "#C26D85" : "none"} style={{ color: "#C26D85" }} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-sans text-sm" style={{ color: "#E7D9C8" }}>
                <input type="checkbox" checked={form.isApproved} onChange={e => setForm(f => ({ ...f, isApproved: e.target.checked }))} className="accent-purple-600" />
                Approved (visible on storefront)
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
