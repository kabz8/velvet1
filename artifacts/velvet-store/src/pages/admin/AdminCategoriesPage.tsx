import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data: categories = [], refetch } = useListCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", slug: "", imageUrl: "" });

  const openCreate = () => { setForm({ name: "", description: "", slug: "", imageUrl: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => { setForm({ name: c.name, description: c.description || "", slug: c.slug, imageUrl: c.imageUrl || "" }); setEditId(c.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCat.mutateAsync({ id: editId, data: form, request: { headers } } as any);
      } else {
        await createCat.mutateAsync(form);
      }
      setShowForm(false);
      refetch();
    } catch { alert("Failed to save category"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await deleteCat.mutateAsync({ id, request: { headers } } as any);
    refetch();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="p-5 rounded-2xl flex items-center gap-4" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-semibold" style={{ color: "#E7D9C8" }}>{cat.name}</h3>
              <p className="font-sans text-xs mt-0.5 truncate" style={{ color: "#A1A1AA" }}>{cat.description || cat.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#A1A1AA" }}><Pencil size={14} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#A1A1AA" }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{editId ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#A1A1AA" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Name *</label>
                <input required className={inputCls} style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} />
              </div>
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Slug</label>
                <input className={inputCls} style={inputStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Description</label>
                <textarea rows={2} className={inputCls} style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1.5 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>Image URL</label>
                <input className={inputCls} style={inputStyle} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              </div>
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
