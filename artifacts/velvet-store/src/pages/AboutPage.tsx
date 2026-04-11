import { Lock, Heart, Shield, Package } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-16">
        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#C26D85", letterSpacing: "0.15em" }}>Our Story</p>
        <h1 className="font-display text-5xl font-semibold mb-6" style={{ color: "#E7D9C8" }}>About Velvet</h1>
        <div className="w-16 h-px mx-auto" style={{ background: "linear-gradient(90deg, #6F2C91, #C26D85)" }} />
      </div>

      <div className="prose prose-invert max-w-none mb-16">
        <p className="font-sans text-base leading-relaxed mb-6" style={{ color: "#A1A1AA" }}>
          Velvet was founded with a simple belief: intimate wellness is a fundamental part of a healthy life, and every adult deserves access to premium products delivered with complete discretion and dignity.
        </p>
        <p className="font-sans text-base leading-relaxed mb-6" style={{ color: "#A1A1AA" }}>
          We curate only the finest, body-safe products from trusted manufacturers worldwide. Every item in our collection has been carefully selected for quality, safety, and effectiveness. We believe that quality should never be compromised when it comes to your personal wellness.
        </p>
        <p className="font-sans text-base leading-relaxed" style={{ color: "#A1A1AA" }}>
          Based in Nairobi, we serve customers across Kenya with fast, discreet delivery. We understand the sensitive nature of our products, which is why privacy and discretion are built into every step of your experience with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: <Lock size={24} />, title: "Complete Discretion", desc: "Plain packaging, no identifying information, private billing. Your privacy is our commitment." },
          { icon: <Heart size={24} />, title: "Wellness First", desc: "We believe in open conversations about intimate wellness. No judgment, only support." },
          { icon: <Shield size={24} />, title: "Safety Guaranteed", desc: "Only body-safe, medical-grade materials. Every product is rigorously vetted for your safety." },
          { icon: <Package size={24} />, title: "Kenya-Wide Delivery", desc: "Fast, reliable delivery across Kenya. Nairobi in 1-2 days, nationwide in 3-5 days." },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl flex gap-5" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(111,44,145,0.15)", color: "#C26D85" }}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-sans font-semibold mb-2" style={{ color: "#E7D9C8" }}>{item.title}</h3>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "#A1A1AA" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center p-10 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(111,44,145,0.12), rgba(194,109,133,0.08))", border: "1px solid rgba(111,44,145,0.2)" }}>
        <h2 className="font-display text-3xl font-semibold mb-4" style={{ color: "#E7D9C8" }}>Ready to explore?</h2>
        <p className="font-sans text-sm mb-8" style={{ color: "#A1A1AA" }}>Browse our curated collection of premium intimate wellness products.</p>
        <Link href="/shop">
          <button className="px-10 py-4 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
            Shop Now
          </button>
        </Link>
      </div>
    </div>
  );
}
