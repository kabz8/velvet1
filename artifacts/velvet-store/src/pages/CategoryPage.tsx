import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { getImageUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const fallbackCategories = [
  { id: 1, name: "Best Sellers", description: "Top-rated customer favorites", imageUrl: "/sample-product.png" },
  { id: 2, name: "New Arrivals", description: "Fresh additions to the collection", imageUrl: "/sample-product.png" },
  { id: 3, name: "Special Offers", description: "Limited-time premium deals", imageUrl: "/sample-product.png" },
];

function isCategoryLike(value: unknown): value is { id: number; name: string; imageUrl?: string | null; description?: string | null } {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { id?: unknown }).id === "number" &&
      typeof (value as { name?: unknown }).name === "string",
  );
}

export default function CategoryPage() {
  const { data: categoriesData, isLoading } = useListCategories();
  const rawCategories = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray((categoriesData as { categories?: unknown } | undefined)?.categories)
      ? ((categoriesData as { categories: typeof categoriesData }).categories as Array<{ id: number; name: string; imageUrl?: string | null; description?: string | null }>)
      : [];
  const categories = rawCategories.filter(isCategoryLike);
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 text-center">
        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#C26D85", letterSpacing: "0.15em" }}>Browse By</p>
        <h1 className="font-display text-5xl font-semibold" style={{ color: "#E7D9C8" }}>Categories</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl animate-pulse" style={{ background: "#14141A" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {displayCategories.map(cat => (
            <Link key={cat.id} href={`/shop?categoryId=${cat.id}`}>
              <div className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="aspect-video">
                  {cat.imageUrl ? (
                    <img src={getImageUrl(cat.imageUrl)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full" style={{ background: "linear-gradient(135deg, rgba(111,44,145,0.3), rgba(194,109,133,0.2))" }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{cat.name}</h2>
                  {cat.description && <p className="font-sans text-xs mt-1 opacity-70" style={{ color: "#E7D9C8" }}>{cat.description}</p>}
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="font-sans text-xs" style={{ color: "#C26D85" }}>Shop now</span>
                    <ArrowRight size={12} style={{ color: "#C26D85" }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
