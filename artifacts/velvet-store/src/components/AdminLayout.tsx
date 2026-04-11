import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, Tag, Image, Users, Settings, LogOut, Menu, X, BarChart2, MessageSquare, HelpCircle, Percent } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/admin" },
  { icon: <Package size={18} />, label: "Products", href: "/admin/products" },
  { icon: <ShoppingCart size={18} />, label: "Orders", href: "/admin/orders" },
  { icon: <Tag size={18} />, label: "Categories", href: "/admin/categories" },
  { icon: <Image size={18} />, label: "Banners", href: "/admin/banners" },
  { icon: <Percent size={18} />, label: "Coupons", href: "/admin/coupons" },
  { icon: <Users size={18} />, label: "Customers", href: "/admin/customers" },
  { icon: <MessageSquare size={18} />, label: "Testimonials", href: "/admin/testimonials" },
  { icon: <HelpCircle size={18} />, label: "FAQs", href: "/admin/faqs" },
  { icon: <Settings size={18} />, label: "Settings", href: "/admin/settings" },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "#0B0B0F" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 w-64 flex-col flex-shrink-0 transition-transform duration-300 lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: "#0E0E14", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <h1 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>Velvet</h1>
            <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>Admin Dashboard</p>
          </div>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)} style={{ color: "#A1A1AA" }}><X size={18} /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-all duration-150 cursor-pointer")}
                  style={{
                    background: isActive ? "rgba(111,44,145,0.2)" : "transparent",
                    color: isActive ? "#E7D9C8" : "#A1A1AA",
                    borderLeft: isActive ? "2px solid #6F2C91" : "2px solid transparent",
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span style={{ color: isActive ? "#C26D85" : "#A1A1AA" }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-sans font-semibold text-xs" style={{ background: "#6F2C91", color: "#E7D9C8" }}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm font-medium truncate" style={{ color: "#E7D9C8" }}>{user?.name || "Admin"}</p>
              <p className="font-sans text-xs truncate" style={{ color: "#A1A1AA" }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors hover:bg-white/5" style={{ color: "#A1A1AA" }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 p-4 border-b lg:hidden" style={{ background: "#0E0E14", borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ color: "#A1A1AA" }}>
            <Menu size={20} />
          </button>
          <span className="font-display text-lg font-semibold" style={{ color: "#E7D9C8" }}>Velvet Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
