import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { useLocation } from "wouter";
import { getSampleProductList } from "@/lib/sampleProducts";

export default function ShopPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(params.get("categoryId") ? parseInt(params.get("categoryId")!) : undefined);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(params.get("isNewArrival") === "true");
  const [isBestSeller, setIsBestSeller] = useState(params.get("isBestSeller") === "true");
  const [isOffer, setIsOffer] = useState(params.get("isOffer") === "true");
  const [inStock, setInStock] = useState(false);

  const { data: categories = [] } = useListCategories();
  const { data, isLoading } = useListProducts({
    params: {
      page,
      limit: 12,
      search: search || undefined,
      categoryId,
      sortBy: sortBy as any,
      isNewArrival: isNewArrival || undefined,
      isBestSeller: isBestSeller || undefined,
      isOffer: isOffer || undefined,
      inStock: inStock || undefined,
    },
  });

  const fallback = getSampleProductList();
  const products = (data?.products?.length ? data.products : fallback.products);
  const totalCount = data?.total && data.total > 0 ? data.total : fallback.total;
  const totalPages = data?.totalPages && data.totalPages > 0 ? data.totalPages : fallback.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold mb-2" style={{ color: "#E7D9C8" }}>Our Collection</h1>
        <p className="font-sans text-sm" style={{ color: "#A1A1AA" }}>
          {`${totalCount} products`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#A1A1AA" }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500"
            style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }}
          />
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-xl font-sans text-sm outline-none"
          style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }}
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-sans text-sm transition-colors"
          style={{ background: filtersOpen ? "rgba(111,44,145,0.2)" : "#14141A", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {filtersOpen && (
        <div className="p-6 rounded-2xl mb-8 flex flex-wrap gap-6" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ color: "#A1A1AA" }}>Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryId(undefined)}
                className="px-3 py-1.5 rounded-lg font-sans text-xs transition-all"
                style={{ background: !categoryId ? "#6F2C91" : "rgba(255,255,255,0.05)", color: "#E7D9C8", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(categoryId === cat.id ? undefined : cat.id)}
                  className="px-3 py-1.5 rounded-lg font-sans text-xs transition-all"
                  style={{ background: categoryId === cat.id ? "#6F2C91" : "rgba(255,255,255,0.05)", color: "#E7D9C8", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ color: "#A1A1AA" }}>Tags</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "New Arrivals", key: "isNewArrival", val: isNewArrival, set: setIsNewArrival },
                { label: "Best Sellers", key: "isBestSeller", val: isBestSeller, set: setIsBestSeller },
                { label: "On Offer", key: "isOffer", val: isOffer, set: setIsOffer },
                { label: "In Stock", key: "inStock", val: inStock, set: setInStock },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => f.set(!f.val)}
                  className="px-3 py-1.5 rounded-lg font-sans text-xs transition-all"
                  style={{ background: f.val ? "#C26D85" : "rgba(255,255,255,0.05)", color: "#E7D9C8", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl aspect-square animate-pulse" style={{ background: "#14141A" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl mb-2" style={{ color: "#E7D9C8" }}>No products found</p>
          <p className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg font-sans text-sm disabled:opacity-40 transition-colors hover:bg-white/5" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Previous</button>
          <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg font-sans text-sm disabled:opacity-40 transition-colors hover:bg-white/5" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>Next</button>
        </div>
      )}
    </div>
  );
}
