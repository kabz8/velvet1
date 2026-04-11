import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatKES, getImageUrl } from "@/lib/utils";
import { Link } from "wouter";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: "#14141A", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} style={{ color: "#C26D85" }} />
                <h2 className="font-display text-lg font-semibold" style={{ color: "#E7D9C8" }}>
                  Your Bag {itemCount > 0 && <span style={{ color: "#A1A1AA" }}>({itemCount})</span>}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: "#A1A1AA" }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" style={{ color: "#A1A1AA" }} />
                  <p className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Your bag is empty</p>
                  <Link href="/shop">
                    <button onClick={() => setIsOpen(false)} className="mt-4 text-sm font-sans" style={{ color: "#C26D85" }}>
                      Explore our collection
                    </button>
                  </Link>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <img
                      src={getImageUrl(item.product.images?.[0]?.url)}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-sm font-medium truncate" style={{ color: "#E7D9C8" }}>{item.product.title}</h3>
                      <p className="font-sans text-sm mt-1" style={{ color: "#C26D85" }}>{formatKES(item.product.price)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <Minus size={12} />
                        </button>
                        <span className="font-sans text-sm w-6 text-center" style={{ color: "#E7D9C8" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeItem(item.product.id)} className="ml-auto text-xs font-sans hover:text-red-400 transition-colors" style={{ color: "#A1A1AA" }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t space-y-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Subtotal</span>
                  <span className="font-sans font-semibold" style={{ color: "#E7D9C8" }}>{formatKES(subtotal)}</span>
                </div>
                <p className="text-xs font-sans" style={{ color: "#A1A1AA" }}>Shipping calculated at checkout</p>
                <Link href="/checkout">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase transition-all duration-200 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}
                  >
                    Proceed to Checkout
                  </button>
                </Link>
                <Link href="/cart">
                  <button onClick={() => setIsOpen(false)} className="w-full py-3 rounded-xl font-sans text-sm transition-colors hover:text-white" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
                    View Cart
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
