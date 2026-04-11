import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Tag } from "lucide-react";

export default function OffersPage() {
  const { data, isLoading } = useListProducts({ params: { isOffer: true, limit: 24 } });
  const products = data?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Tag size={32} className="mx-auto mb-4" style={{ color: "#C26D85" }} />
        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#C26D85", letterSpacing: "0.15em" }}>Limited Time</p>
        <h1 className="font-display text-5xl font-semibold mb-3" style={{ color: "#E7D9C8" }}>Special Offers</h1>
        <p className="font-sans text-base" style={{ color: "#A1A1AA" }}>Exclusive deals on premium intimate wellness products</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: "#14141A" }} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl" style={{ color: "#E7D9C8" }}>No active offers at the moment</p>
          <p className="font-sans text-sm mt-2" style={{ color: "#A1A1AA" }}>Check back soon for new deals</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
