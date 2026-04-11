import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import { formatKES, getImageUrl } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className={cn("group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl", className)}
      style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-square overflow-hidden cursor-pointer">
          <img
            src={getImageUrl(primaryImage?.url)}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {product.isNewArrival && (
              <span className="text-xs font-sans font-semibold px-2 py-1 rounded-full" style={{ background: "#6F2C91", color: "#E7D9C8" }}>New</span>
            )}
            {product.isBestSeller && (
              <span className="text-xs font-sans font-semibold px-2 py-1 rounded-full" style={{ background: "#C26D85", color: "#E7D9C8" }}>Best Seller</span>
            )}
            {product.isOffer && (
              <span className="text-xs font-sans font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(231,217,200,0.2)", color: "#E7D9C8" }}>Offer</span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-display text-base font-medium cursor-pointer hover:text-white transition-colors line-clamp-1" style={{ color: "#E7D9C8" }}>
            {product.title}
          </h3>
        </Link>
        {product.shortDescription && (
          <p className="font-sans text-xs mt-1 line-clamp-2" style={{ color: "#A1A1AA" }}>{product.shortDescription}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-sans font-semibold text-sm" style={{ color: "#C26D85" }}>{formatKES(product.price)}</span>
            {isOnSale && (
              <span className="font-sans text-xs ml-2 line-through" style={{ color: "#A1A1AA" }}>{formatKES(product.compareAtPrice!)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
            style={{ background: "rgba(111,44,145,0.2)", color: "#C26D85", border: "1px solid rgba(111,44,145,0.4)" }}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
