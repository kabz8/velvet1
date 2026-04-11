import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";

export function Footer() {
  const { data: settings } = useGetSettings();
  const storeName = settings?.storeName || "Velvet";

  return (
    <footer className="border-t mt-16" style={{ background: "#0B0B0F", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-semibold mb-4" style={{ color: "#E7D9C8" }}>{storeName}</h3>
            <p className="font-sans text-sm leading-relaxed" style={{ color: "#A1A1AA" }}>
              Premium intimate wellness products, curated with discretion and delivered with care across Kenya.
            </p>
            {settings?.socialWhatsapp && (
              <a href={`https://wa.me/${settings.socialWhatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-sans transition-colors hover:text-white" style={{ color: "#A1A1AA" }}>
                WhatsApp Us
              </a>
            )}
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#A1A1AA", letterSpacing: "0.1em" }}>Shop</h4>
            <ul className="space-y-2">
              {[["All Products", "/shop"], ["Categories", "/categories"], ["Offers", "/offers"], ["New Arrivals", "/shop?isNewArrival=true"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href as string}>
                    <span className="font-sans text-sm transition-colors hover:text-white cursor-pointer" style={{ color: "#A1A1AA" }}>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#A1A1AA", letterSpacing: "0.1em" }}>Support</h4>
            <ul className="space-y-2">
              {[["FAQ", "/faq"], ["Contact Us", "/contact"], ["Shipping & Returns", "/shipping"], ["Privacy & Packaging", "/privacy"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href as string}>
                    <span className="font-sans text-sm transition-colors hover:text-white cursor-pointer" style={{ color: "#A1A1AA" }}>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#A1A1AA", letterSpacing: "0.1em" }}>Legal</h4>
            <ul className="space-y-2">
              {[["Terms & Conditions", "/terms"], ["Privacy Policy", "/privacy"], ["Anonymous Checkout", "/anonymous-checkout"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href as string}>
                    <span className="font-sans text-sm transition-colors hover:text-white cursor-pointer" style={{ color: "#A1A1AA" }}>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>
            {settings?.footerText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans px-3 py-1 rounded-full" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
              Discreet Packaging
            </span>
            <span className="text-xs font-sans px-3 py-1 rounded-full" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
              Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
