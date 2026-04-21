import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder, useValidateCoupon, useGetShippingSettings, useGetSettings } from "@workspace/api-client-react";
import { formatKES, getImageUrl } from "@/lib/utils";
import { Lock, Shield, MessageCircle } from "lucide-react";
import { getSampleProductById } from "@/lib/sampleProducts";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [, navigate] = useLocation();

  const { data: shippingSettings } = useGetShippingSettings();
  const { data: siteSettings } = useGetSettings();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    isAnonymous: false,
    deliveryAddress: "",
    deliveryRegion: "nairobi" as "nairobi" | "outside_nairobi",
    notes: "",
    couponCode: "",
    paymentMethod: "cash_on_delivery" as "cash_on_delivery" | "manual_payment" | "pending",
  });
  const [couponApplied, setCouponApplied] = useState<{ discountAmount: number; code: string } | null>(null);
  const [couponError, setCouponError] = useState("");

  const normalizedItems = items.map((item) => {
    const sample = getSampleProductById(item.product.id);
    const price =
      typeof item.product.price === "number" && Number.isFinite(item.product.price) && item.product.price > 0
        ? item.product.price
        : sample?.price ?? 0;
    const imageUrl = item.product.images?.[0]?.url || sample?.images?.[0]?.url || "/sample-product.png";
    return {
      ...item,
      product: {
        ...item.product,
        title: item.product.title || sample?.title || `Product ${item.product.id}`,
        price,
        images: [{ id: 1, productId: item.product.id, url: imageUrl, altText: null, sortOrder: 0, isPrimary: true }],
      },
    };
  });
  const normalizedSubtotal = normalizedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();

  const nairobiFee = shippingSettings?.nairobiCountyFee ?? 300;
  const outsideFee = shippingSettings?.outsideNairobiFee ?? 450;
  const shippingFee = form.deliveryRegion === "nairobi" ? nairobiFee : outsideFee;
  const discount = couponApplied?.discountAmount ?? 0;
  const total = normalizedSubtotal + shippingFee - discount;
  const whatsappPhoneRaw = siteSettings?.socialWhatsapp || siteSettings?.storePhone || "";
  const whatsappPhone = whatsappPhoneRaw.replace(/[^\d]/g, "");

  const handleCouponValidate = async () => {
    setCouponError("");
    if (!form.couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({ code: form.couponCode, orderAmount: normalizedSubtotal });
      if (result.valid) {
        setCouponApplied({ discountAmount: result.discountAmount, code: form.couponCode });
      } else {
        setCouponError(result.message || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
  };

  const handleWhatsAppCheckout = () => {
    const itemLines = normalizedItems
      .map((item) => `- ${item.product.title} x${item.quantity} (${formatKES(item.product.price * item.quantity)})`)
      .join("\n");
    const message = [
      "Hello, I would like to place an order:",
      "",
      itemLines,
      "",
      `Subtotal: ${formatKES(normalizedSubtotal)}`,
      `Shipping: ${formatKES(shippingFee)}`,
      `Total: ${formatKES(total)}`,
      "",
      `Phone: ${form.customerPhone || "-"}`,
      `Name: ${form.isAnonymous ? "Anonymous" : (form.customerName || "-")}`,
      `Address: ${form.deliveryAddress || "-"}`,
      `Region: ${form.deliveryRegion === "nairobi" ? "Nairobi" : "Outside Nairobi"}`,
    ].join("\n");

    const waUrl = whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (normalizedItems.some((item) => item.product.id >= 9000)) {
      alert("Sample products cannot be submitted as live orders yet. Please use Checkout via WhatsApp.");
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        customerName: form.isAnonymous ? null : form.customerName || null,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || null,
        isAnonymous: form.isAnonymous,
        deliveryAddress: form.deliveryAddress,
        deliveryRegion: form.deliveryRegion,
        notes: form.notes || null,
        couponCode: couponApplied?.code || null,
        paymentMethod: form.paymentMethod,
        items: normalizedItems.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      const message = err?.data?.error || err?.message || "Failed to place order. Please try again.";
      alert(message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl mb-4" style={{ color: "#E7D9C8" }}>Your bag is empty</h1>
        <a href="/shop" className="font-sans text-sm" style={{ color: "#C26D85" }}>Continue shopping</a>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500 transition-colors";
  const inputStyle = { background: "#14141A", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };
  const labelStyle = { color: "#A1A1AA", fontSize: "0.75rem", fontFamily: "DM Sans", textTransform: "uppercase" as const, letterSpacing: "0.08em" };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-semibold mb-2" style={{ color: "#E7D9C8" }}>Checkout</h1>
      <div className="flex items-center gap-2 mb-10">
        <Lock size={14} style={{ color: "#C26D85" }} />
        <span className="font-sans text-xs" style={{ color: "#A1A1AA" }}>Secure, discreet checkout. Your privacy is protected.</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div className="p-6 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-display text-xl font-semibold mb-5" style={{ color: "#E7D9C8" }}>Contact Details</h2>

              <div className="flex items-center gap-3 mb-5 p-4 rounded-xl" style={{ background: "rgba(111,44,145,0.1)", border: "1px solid rgba(111,44,145,0.2)" }}>
                <input type="checkbox" id="anon" checked={form.isAnonymous} onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                <label htmlFor="anon" className="font-sans text-sm cursor-pointer" style={{ color: "#E7D9C8" }}>
                  Anonymous checkout — no name required
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!form.isAnonymous && (
                  <div>
                    <label className="block mb-1.5" style={labelStyle}>Name (optional)</label>
                    <input className={inputCls} style={inputStyle} value={form.customerName} placeholder="Your name or initials" onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
                  </div>
                )}
                <div className={form.isAnonymous ? "md:col-span-2" : ""}>
                  <label className="block mb-1.5" style={labelStyle}>Phone Number *</label>
                  <input className={inputCls} style={inputStyle} required value={form.customerPhone} placeholder="+254 700 000 000" onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1.5" style={labelStyle}>Email (optional)</label>
                  <input type="email" className={inputCls} style={inputStyle} value={form.customerEmail} placeholder="For order updates" onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="p-6 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-display text-xl font-semibold mb-5" style={{ color: "#E7D9C8" }}>Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5" style={labelStyle}>Delivery Region *</label>
                  <select required className={inputCls} style={inputStyle} value={form.deliveryRegion} onChange={e => setForm(f => ({ ...f, deliveryRegion: e.target.value as any }))}>
                    <option value="nairobi">Nairobi County — {formatKES(nairobiFee)}</option>
                    <option value="outside_nairobi">Outside Nairobi — {formatKES(outsideFee)}</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5" style={labelStyle}>Delivery Address *</label>
                  <textarea required rows={3} className={inputCls} style={inputStyle} value={form.deliveryAddress} placeholder="Street, estate, building, apartment..." onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} />
                </div>
                <div>
                  <label className="block mb-1.5" style={labelStyle}>Order Notes (optional)</label>
                  <textarea rows={2} className={inputCls} style={inputStyle} value={form.notes} placeholder="Any special delivery instructions..." onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="p-6 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-display text-xl font-semibold mb-5" style={{ color: "#E7D9C8" }}>Payment Method</h2>
              <div className="space-y-3">
                {siteSettings?.cashOnDeliveryEnabled && (
                  <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all" style={{ background: form.paymentMethod === "cash_on_delivery" ? "rgba(111,44,145,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.paymentMethod === "cash_on_delivery" ? "#6F2C91" : "rgba(255,255,255,0.08)"}` }}>
                    <input type="radio" name="payment" value="cash_on_delivery" checked={form.paymentMethod === "cash_on_delivery"} onChange={() => setForm(f => ({ ...f, paymentMethod: "cash_on_delivery" }))} className="accent-purple-600" />
                    <div>
                      <span className="font-sans text-sm font-medium" style={{ color: "#E7D9C8" }}>Cash on Delivery</span>
                      <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>Pay when your order arrives</p>
                    </div>
                  </label>
                )}
                <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all" style={{ background: form.paymentMethod === "manual_payment" ? "rgba(111,44,145,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.paymentMethod === "manual_payment" ? "#6F2C91" : "rgba(255,255,255,0.08)"}` }}>
                  <input type="radio" name="payment" value="manual_payment" checked={form.paymentMethod === "manual_payment"} onChange={() => setForm(f => ({ ...f, paymentMethod: "manual_payment" }))} className="accent-purple-600" />
                  <div>
                    <span className="font-sans text-sm font-medium" style={{ color: "#E7D9C8" }}>Pay Later / Bank Transfer</span>
                    <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>We will contact you with payment details</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl sticky top-20" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-display text-xl font-semibold mb-5" style={{ color: "#E7D9C8" }}>Order Summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {normalizedItems.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <img src={getImageUrl(item.product.images?.[0]?.url)} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-medium truncate" style={{ color: "#E7D9C8" }}>{item.product.title}</p>
                      <p className="font-sans text-xs mt-0.5" style={{ color: "#A1A1AA" }}>x{item.quantity} · {formatKES(item.product.price)}</p>
                    </div>
                    <span className="font-sans text-xs font-semibold" style={{ color: "#E7D9C8" }}>{formatKES(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <label className="block mb-1.5" style={labelStyle}>Coupon Code</label>
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2.5 rounded-lg font-sans text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }} value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))} placeholder="VELVET10" />
                  <button type="button" onClick={handleCouponValidate} className="px-3 py-2.5 rounded-lg font-sans text-xs font-semibold" style={{ background: "#6F2C91", color: "#E7D9C8" }}>Apply</button>
                </div>
                {couponError && <p className="font-sans text-xs mt-1" style={{ color: "#EF4444" }}>{couponError}</p>}
                {couponApplied && <p className="font-sans text-xs mt-1" style={{ color: "#10B981" }}>Coupon applied! Saving {formatKES(couponApplied.discountAmount)}</p>}
              </div>

              <div className="space-y-2 py-4 border-t border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between">
                  <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Subtotal</span>
                  <span className="font-sans text-sm" style={{ color: "#E7D9C8" }}>{formatKES(normalizedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-sm" style={{ color: "#A1A1AA" }}>Shipping</span>
                  <span className="font-sans text-sm" style={{ color: "#E7D9C8" }}>{formatKES(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-sm" style={{ color: "#10B981" }}>Discount</span>
                    <span className="font-sans text-sm" style={{ color: "#10B981" }}>-{formatKES(discount)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-4 mb-6">
                <span className="font-display text-lg font-semibold" style={{ color: "#E7D9C8" }}>Total</span>
                <span className="font-display text-lg font-semibold" style={{ color: "#C26D85" }}>{formatKES(total)}</span>
              </div>

              <button type="submit" disabled={createOrder.isPending} className="w-full py-4 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
                {createOrder.isPending ? "Placing Order..." : "Place Order"}
              </button>
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 mt-3 rounded-xl font-sans font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "#25D366", color: "#0B0B0F" }}
              >
                <MessageCircle size={16} />
                Checkout via WhatsApp
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Shield size={12} style={{ color: "#A1A1AA" }} />
                <span className="font-sans text-xs" style={{ color: "#A1A1AA" }}>Secure, private checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
