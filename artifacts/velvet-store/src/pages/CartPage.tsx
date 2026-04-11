import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatKES, getImageUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto mb-6 opacity-20" style={{ color: "#A1A1AA" }} />
        <h1 className="font-display text-3xl font-semibold mb-3" style={{ color: "#E7D9C8" }}>Your bag is empty</h1>
        <p className="font-sans text-sm mb-8" style={{ color: "#A1A1AA" }}>Discover our curated collection of intimate wellness products</p>
        <Link href="/shop">
          <button className="px-8 py-4 rounded-xl font-sans font-semibold text-sm" style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
            Shop Collection
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-semibold" style={{ color: "#E7D9C8" }}>Your Bag</h1>
        <button onClick={clearCart} className="font-sans text-sm hover:text-red-400 transition-colors" style={{ color: "#A1A1AA" }}>Clear all</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-4 p-5 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <img src={getImageUrl(item.product.images?.[0]?.url)} alt={item.product.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base font-medium mb-1 truncate" style={{ color: "#E7D9C8" }}>{item.product.title}</h3>
                <p className="font-sans text-sm" style={{ color: "#C26D85" }}>{formatKES(item.product.price)}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-l-lg transition-colors" style={{ color: "#A1A1AA" }}>
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-sans text-sm" style={{ color: "#E7D9C8" }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-r-lg transition-colors" style={{ color: "#A1A1AA" }}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-sans font-semibold text-sm" style={{ color: "#E7D9C8" }}>{formatKES(item.product.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.product.id)} className="hover:text-red-400 transition-colors p-1" style={{ color: "#A1A1AA" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="p-6 rounded-2xl sticky top-20" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-display text-xl font-semibold mb-6" style={{ color: "#E7D9C8" }}>Summary</h2>
            <div className="space-y-3 mb-6 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between font-sans text-sm">
                <span style={{ color: "#A1A1AA" }}>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span style={{ color: "#E7D9C8" }}>{formatKES(subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm">
                <span style={{ color: "#A1A1AA" }}>Shipping</span>
                <span style={{ color: "#A1A1AA" }}>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-display text-base font-semibold" style={{ color: "#E7D9C8" }}>Subtotal</span>
              <span className="font-display text-base font-semibold" style={{ color: "#C26D85" }}>{formatKES(subtotal)}</span>
            </div>
            <Link href="/checkout">
              <button className="w-full py-4 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
                Checkout
              </button>
            </Link>
            <Link href="/shop">
              <button className="w-full py-3 rounded-xl font-sans text-sm mt-3 hover:bg-white/5 transition-colors"
                style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
