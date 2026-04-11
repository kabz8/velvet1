import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useListFaqs, useCreateFaq, useUpdateFaq, useDeleteFaq } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminFaqsPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data: faqs = [], refetch } = useListFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", sortOrder: 0, isActive: true });

  const openCreate = () => { setForm({ question: "", answer: "", sortOrder: faqs.length, isActive: true }); setEditId(null); setShowForm(true); };
  const openEdit = (f: any) => { setForm({ question: f.question, answer: f.answer, sortOrder: f.sortOrder, isActive: f.isActive }); setEditId(f.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateFaq.mutateAsync({ id: editId, data: form, request: { headers } } as any);
      } else {
        await createFaq.mutateAsync({ ...form, request: { headers } } as any);
      }
      setShowForm(false);
      refetch();
    } catch { alert("Failed to save FAQ"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    await deleteFaq.mutateAsync({ id, request: { headers } } as any);
    refetch();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>FAQs</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="p-5 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-sans font-medium" style={{ color: "#E7D9C8" }}>{faq.question}</p>
                <p className="font-sans text-sm mt-2" style={{ color: "#A1A1AA" }}>{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full font-sans text-xs" style={{ background: faq.isActive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: faq.isActive ? "#22C55E" : "#A1A1AA" }}>{faq.isActive ? "Active" : "Hidden"}</span>
                <button onClick={() => openEdit(faq)} className="p-1.5 hover:bg-white/5 rounded-lg" style={{ color: "#A1A1AA" }}><Pencil size={14} /></button>
                <button onClick={() => handleDelete(faq.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" style={{ color: "#A1A1AA" }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{editId ? "Edit" : "Add"} FAQ</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#A1A1AA" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Question *</label>
                <input required className={inputCls} style={inputStyle} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Answer *</label>
                <textarea required rows={4} className={inputCls} style={inputStyle} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Sort Order</label>
                  <input type="number" className={inputCls} style={inputStyle} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: +e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-sans text-sm" style={{ color: "#E7D9C8" }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-purple-600" />
                Active (visible on storefront)
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
