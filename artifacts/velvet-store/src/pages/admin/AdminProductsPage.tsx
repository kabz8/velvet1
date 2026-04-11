import { useState } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useListCategories, useUploadFile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { formatKES, getImageUrl } from "@/lib/utils";

const defaultForm = {
  title: "", shortDescription: "", description: "", price: 0, compareAtPrice: undefined as number | undefined,
  categoryId: undefined as number | undefined, stockQuantity: 10, sku: "", status: "published" as const,
  isNewArrival: false, isBestSeller: false, isOffer: false, tags: [] as string[], images: [] as any[],
};

export default function AdminProductsPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { data, refetch } = useListProducts({ params: { page, limit: 15, search: search || undefined, status: undefined } });
  const { data: cats = [] } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadFile();

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const openCreate = () => { setForm({ ...defaultForm }); setImageFiles([]); setEditId(null); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({
      title: p.title, shortDescription: p.shortDescription || "", description: p.description || "",
      price: p.price, compareAtPrice: p.compareAtPrice || undefined,
      categoryId: p.category?.id || p.categoryId, stockQuantity: p.stockQuantity,
      sku: p.sku || "", status: p.status, isNewArrival: p.isNewArrival, isBestSeller: p.isBestSeller,
      isOffer: p.isOffer, tags: p.tags || [], images: p.images || [],
    });
    setImageFiles([]);
    setEditId(p.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async ev => {
        const base64 = ev.target?.result as string;
        try {
          const res = await uploadImage.mutateAsync({ data: { data: base64, filename: file.name, mimeType: file.type } });
          setImageFiles(prev => [...prev, res.url]);
        } catch {}
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, newImageUrls: imageFiles };
    try {
      if (editId) {
        await updateProduct.mutateAsync({ id: editId, data: payload as any, request: { headers } } as any);
      } else {
        await createProduct.mutateAsync({ ...payload } as any);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      alert("Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct.mutateAsync({ id, request: { headers } } as any);
    refetch();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };
  const labelCls = "block mb-1.5 font-sans text-xs uppercase tracking-wider";
  const labelStyle = { color: "#A1A1AA" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input className={inputCls + " max-w-sm"} style={inputStyle} placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["Image", "Title", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider" style={{ color: "#A1A1AA" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-3">
                  <img src={getImageUrl(p.images?.[0]?.url)} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-sans text-sm font-medium" style={{ color: "#E7D9C8" }}>{p.title}</p>
                  <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{p.sku}</p>
                </td>
                <td className="px-4 py-3 font-sans text-xs" style={{ color: "#A1A1AA" }}>{p.category?.name || "—"}</td>
                <td className="px-4 py-3 font-sans text-sm" style={{ color: "#C26D85" }}>{formatKES(p.price)}</td>
                <td className="px-4 py-3 font-sans text-sm" style={{ color: p.stockQuantity < 3 ? "#EF4444" : "#A1A1AA" }}>{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full font-sans text-xs capitalize" style={{ background: p.status === "published" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)", color: p.status === "published" ? "#22C55E" : "#A1A1AA" }}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#A1A1AA" }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "#A1A1AA" }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl font-sans text-sm disabled:opacity-40" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Previous</button>
          <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl font-sans text-sm disabled:opacity-40" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Next</button>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/70 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl mb-8" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{editId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#A1A1AA" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls} style={labelStyle}>Title *</label>
                  <input required className={inputCls} style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Price (KES) *</label>
                  <input type="number" required className={inputCls} style={inputStyle} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Compare At Price</label>
                  <input type="number" className={inputCls} style={inputStyle} value={form.compareAtPrice || ""} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value ? +e.target.value : undefined }))} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Category</label>
                  <select className={inputCls} style={inputStyle} value={form.categoryId || ""} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value ? +e.target.value : undefined }))}>
                    <option value="">— No category —</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Stock</label>
                  <input type="number" className={inputCls} style={inputStyle} value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: +e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>SKU</label>
                  <input className={inputCls} style={inputStyle} value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Status</label>
                  <select className={inputCls} style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls} style={labelStyle}>Short Description</label>
                  <textarea rows={2} className={inputCls} style={inputStyle} value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls} style={labelStyle}>Description</label>
                  <textarea rows={3} className={inputCls} style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4">
                  {[["New Arrival", "isNewArrival"], ["Best Seller", "isBestSeller"], ["On Offer", "isOffer"]].map(([label, key]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer font-sans text-sm" style={{ color: "#E7D9C8" }}>
                      <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-purple-600" />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="col-span-2">
                  <label className={labelCls} style={labelStyle}>Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input className={inputCls} style={inputStyle} value={tagInput} placeholder="Add tag..." onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] })); setTagInput(""); } } }} />
                    <button type="button" onClick={() => { if (tagInput.trim()) { setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] })); setTagInput(""); } }} className="px-4 py-2.5 rounded-xl font-sans text-sm" style={{ background: "#6F2C91", color: "#E7D9C8" }}>+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full font-sans text-xs" style={{ background: "rgba(111,44,145,0.2)", color: "#C26D85" }}>
                        {tag}
                        <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter((_, ti) => ti !== i) }))} style={{ color: "#A1A1AA" }}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelCls} style={labelStyle}>Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((img: any) => (
                      <img key={img.id} src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg opacity-70" />
                    ))}
                    {imageFiles.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        <button type="button" onClick={() => setImageFiles(f => f.filter((_, fi) => fi !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#EF4444", color: "white" }}><X size={10} /></button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors" style={{ border: "2px dashed rgba(255,255,255,0.2)", color: "#A1A1AA" }}>
                      <Upload size={16} />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-sans text-sm" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="flex-1 py-3 rounded-xl font-sans font-semibold text-sm disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
                  {editId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
