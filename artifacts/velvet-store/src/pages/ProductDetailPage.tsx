import { useState } from "react";
import { useRoute, Link } from "wouter";
import { ShoppingBag, Shield, Lock, Truck, ChevronLeft } from "lucide-react";
import { useGetProduct, useGetRelatedProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { formatKES, getImageUrl } from "@/lib/utils";

export default function ProductDetailPage() {
  const [, params] = useRoute("/shop/:id");
  const id = parseInt(params?.id || "0");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } });
  const { data: related = [] } = useGetRelatedProducts(id, { query: { enabled: !!id } });
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl" style={{ background: "#14141A" }} />
          <div className="space-y-4">
            <div className="h-8 rounded-lg w-3/4" style={{ background: "#14141A" }} />
            <div className="h-6 rounded-lg w-1/2" style={{ background: "#14141A" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-2xl" style={{ color: "#E7D9C8" }}>Product not found</p>
        <Link href="/shop"><button className="mt-4 font-sans text-sm" style={{ color: "#C26D85" }}>Back to Shop</button></Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || images[0];
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/shop">
        <button className="flex items-center gap-2 font-sans text-sm mb-8 hover:text-white transition-colors" style={{ color: "#A1A1AA" }}>
          <ChevronLeft size={16} />
          Back to Shop
        </button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: "#14141A" }}>
            <img src={getImageUrl(currentImage?.url)} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className="w-16 h-16 rounded-lg overflow-hidden transition-all"
                  style={{ border: i === selectedImageIndex ? "2px solid #6F2C91" : "2px solid transparent", opacity: i === selectedImageIndex ? 1 : 0.6 }}
                >
                  <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.isNewArrival && <span className="text-xs font-sans px-2 py-1 rounded-full" style={{ background: "#6F2C91", color: "#E7D9C8" }}>New</span>}
            {product.isBestSeller && <span className="text-xs font-sans px-2 py-1 rounded-full" style={{ background: "#C26D85", color: "#E7D9C8" }}>Best Seller</span>}
            {product.isOffer && <span className="text-xs font-sans px-2 py-1 rounded-full" style={{ background: "rgba(231,217,200,0.15)", color: "#E7D9C8" }}>Special Offer</span>}
          </div>

          <h1 className="font-display text-4xl font-semibold mb-2" style={{ color: "#E7D9C8" }}>{product.title}</h1>

          {product.category && (
            <Link href={`/shop?categoryId=${product.category.id}`}>
              <span className="font-sans text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#A1A1AA" }}>{product.category.name}</span>
            </Link>
          )}

          <div className="flex items-center gap-4 my-6">
            <span className="font-display text-3xl font-semibold" style={{ color: "#C26D85" }}>{formatKES(product.price)}</span>
            {isOnSale && <span className="font-sans text-lg line-through" style={{ color: "#A1A1AA" }}>{formatKES(product.compareAtPrice!)}</span>}
          </div>

          {product.shortDescription && (
            <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: "#A1A1AA" }}>{product.shortDescription}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#14141A" }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-12 flex items-center justify-center text-lg hover:bg-white/5 rounded-l-xl transition-colors" style={{ color: "#A1A1AA" }}>−</button>
              <span className="w-10 text-center font-sans" style={{ color: "#E7D9C8" }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-12 flex items-center justify-center text-lg hover:bg-white/5 rounded-r-xl transition-colors" style={{ color: "#A1A1AA" }}>+</button>
            </div>
            <button
              onClick={() => addItem(product, quantity)}
              disabled={product.stockQuantity === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}
            >
              <ShoppingBag size={16} />
              {product.stockQuantity === 0 ? "Out of Stock" : "Add to Bag"}
            </button>
          </div>

          {product.stockQuantity > 0 && product.stockQuantity < 5 && (
            <p className="font-sans text-xs mb-4" style={{ color: "#C26D85" }}>Only {product.stockQuantity} left in stock</p>
          )}

          {/* Trust badges */}
          <div className="space-y-3 py-6 border-t border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {[
              { icon: <Lock size={14} />, text: "Shipped in plain, unmarked packaging" },
              { icon: <Truck size={14} />, text: "Nairobi delivery from KES 300" },
              { icon: <Shield size={14} />, text: "Body-safe, premium quality guaranteed" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <span style={{ color: "#C26D85" }}>{b.icon}</span>
                <span className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{b.text}</span>
              </div>
            ))}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="font-sans font-semibold text-sm mb-3" style={{ color: "#E7D9C8" }}>Description</h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "#A1A1AA" }}>{product.description}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs font-sans px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#A1A1AA" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: "#E7D9C8" }}>You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
