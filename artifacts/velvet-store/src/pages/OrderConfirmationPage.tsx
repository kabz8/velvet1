import { useRoute, Link } from "wouter";
import { CheckCircle, Package, Phone } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import { formatKES } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const [, params] = useRoute("/order-confirmation/:id");
  const id = parseInt(params?.id || "0");
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) return <div className="text-center py-20"><div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" /></div>;

  if (!order) return (
    <div className="text-center py-20">
      <p className="font-display text-2xl" style={{ color: "#E7D9C8" }}>Order not found</p>
      <Link href="/"><button className="mt-4 font-sans text-sm" style={{ color: "#C26D85" }}>Return Home</button></Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="mb-8">
        <CheckCircle size={60} className="mx-auto mb-4" style={{ color: "#10B981" }} />
        <h1 className="font-display text-4xl font-semibold mb-2" style={{ color: "#E7D9C8" }}>Thank You</h1>
        <p className="font-sans text-base" style={{ color: "#A1A1AA" }}>Your order has been received and is being processed.</p>
      </div>

      <div className="p-6 rounded-2xl mb-8" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Order Number</span>
          <span className="font-sans font-semibold" style={{ color: "#E7D9C8" }}>{order.orderNumber}</span>
        </div>

        <div className="space-y-3 mb-4">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm font-sans">
              <span style={{ color: "#A1A1AA" }}>{item.productTitle} × {item.quantity}</span>
              <span style={{ color: "#E7D9C8" }}>{formatKES(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between font-sans text-sm">
            <span style={{ color: "#A1A1AA" }}>Subtotal</span>
            <span style={{ color: "#E7D9C8" }}>{formatKES(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-sans text-sm">
            <span style={{ color: "#A1A1AA" }}>Shipping</span>
            <span style={{ color: "#E7D9C8" }}>{formatKES(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between font-sans text-sm">
              <span style={{ color: "#10B981" }}>Discount</span>
              <span style={{ color: "#10B981" }}>-{formatKES(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-display text-lg font-semibold pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span style={{ color: "#E7D9C8" }}>Total</span>
            <span style={{ color: "#C26D85" }}>{formatKES(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-xl text-left" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Package size={16} className="mb-2" style={{ color: "#C26D85" }} />
          <h3 className="font-sans text-sm font-semibold mb-1" style={{ color: "#E7D9C8" }}>Delivery</h3>
          <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{order.deliveryRegion === "nairobi" ? "Nairobi County" : "Outside Nairobi"}</p>
          <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{order.deliveryAddress}</p>
        </div>
        <div className="p-4 rounded-xl text-left" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Phone size={16} className="mb-2" style={{ color: "#C26D85" }} />
          <h3 className="font-sans text-sm font-semibold mb-1" style={{ color: "#E7D9C8" }}>Contact</h3>
          <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{order.customerPhone}</p>
          <p className="font-sans text-xs mt-1" style={{ color: "#A1A1AA" }}>We'll contact you to arrange delivery</p>
        </div>
      </div>

      <p className="font-sans text-xs mb-6" style={{ color: "#A1A1AA" }}>
        Your order will be shipped in plain, discreet packaging. No identifying store information will appear on the package.
      </p>

      <Link href="/shop">
        <button className="px-8 py-3 rounded-xl font-sans font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}
