import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { useGetSettings } from "@workspace/api-client-react";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Offers", href: "/offers" },
  { label: "About", href: "/about" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, setIsOpen } = useCart();
  const [location] = useLocation();
  const { data: settings } = useGetSettings();

  const storeName = settings?.storeName || "Velvet";
  const announcement = settings?.announcementBar;
  const announcementEnabled = settings?.announcementBarEnabled;

  return (
    <>
      {announcementEnabled && announcement && (
        <div className="text-center py-2 px-4 text-xs font-sans" style={{ background: "#6F2C91", color: "#E7D9C8", letterSpacing: "0.05em" }}>
          {announcement}
        </div>
      )}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(11,11,15,0.95)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="font-display text-2xl font-semibold cursor-pointer" style={{ color: "#E7D9C8", letterSpacing: "0.05em" }}>
                {storeName}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span className={cn(
                    "text-sm font-sans transition-colors duration-200 cursor-pointer",
                    location === link.href ? "text-white" : "hover:text-white"
                  )} style={{ color: location === link.href ? "#E7D9C8" : "#A1A1AA" }}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-lg transition-colors duration-200 hover:bg-white/5"
                style={{ color: "#E7D9C8" }}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-sans font-semibold"
                    style={{ background: "#6F2C91", color: "#E7D9C8" }}>
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: "#E7D9C8" }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t py-4 px-4 space-y-2" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(11,11,15,0.98)" }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <div className="block py-3 px-4 rounded-lg text-sm font-sans" style={{ color: "#A1A1AA" }} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
