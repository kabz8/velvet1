import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AgeGate } from "@/components/AgeGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AdminLayout } from "@/components/AdminLayout";
import { useLocation } from "wouter";
import { useEffect } from "react";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CategoryPage from "@/pages/CategoryPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import OffersPage from "@/pages/OffersPage";
import FAQPage from "@/pages/FAQPage";
import AboutPage from "@/pages/AboutPage";

import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminBannersPage from "@/pages/admin/AdminBannersPage";
import AdminCouponsPage from "@/pages/admin/AdminCouponsPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminTestimonialsPage from "@/pages/admin/AdminTestimonialsPage";
import AdminFaqsPage from "@/pages/admin/AdminFaqsPage";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeGate />
      <Header />
      <CartDrawer />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0F" }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <AdminLayout>{children}</AdminLayout>;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/products">
        <AdminGuard><AdminProductsPage /></AdminGuard>
      </Route>
      <Route path="/admin/orders">
        <AdminGuard><AdminOrdersPage /></AdminGuard>
      </Route>
      <Route path="/admin/categories">
        <AdminGuard><AdminCategoriesPage /></AdminGuard>
      </Route>
      <Route path="/admin/banners">
        <AdminGuard><AdminBannersPage /></AdminGuard>
      </Route>
      <Route path="/admin/coupons">
        <AdminGuard><AdminCouponsPage /></AdminGuard>
      </Route>
      <Route path="/admin/customers">
        <AdminGuard><AdminCustomersPage /></AdminGuard>
      </Route>
      <Route path="/admin/testimonials">
        <AdminGuard><AdminTestimonialsPage /></AdminGuard>
      </Route>
      <Route path="/admin/faqs">
        <AdminGuard><AdminFaqsPage /></AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard><AdminSettingsPage /></AdminGuard>
      </Route>

      {/* Storefront routes */}
      <Route path="/">
        <StorefrontLayout><HomePage /></StorefrontLayout>
      </Route>
      <Route path="/shop">
        <StorefrontLayout><ShopPage /></StorefrontLayout>
      </Route>
      <Route path="/shop/:id">
        <StorefrontLayout><ProductDetailPage /></StorefrontLayout>
      </Route>
      <Route path="/categories">
        <StorefrontLayout><CategoryPage /></StorefrontLayout>
      </Route>
      <Route path="/cart">
        <StorefrontLayout><CartPage /></StorefrontLayout>
      </Route>
      <Route path="/checkout">
        <StorefrontLayout><CheckoutPage /></StorefrontLayout>
      </Route>
      <Route path="/order-confirmation/:id">
        <StorefrontLayout><OrderConfirmationPage /></StorefrontLayout>
      </Route>
      <Route path="/offers">
        <StorefrontLayout><OffersPage /></StorefrontLayout>
      </Route>
      <Route path="/faq">
        <StorefrontLayout><FAQPage /></StorefrontLayout>
      </Route>
      <Route path="/about">
        <StorefrontLayout><AboutPage /></StorefrontLayout>
      </Route>
      <Route>
        <StorefrontLayout><NotFound /></StorefrontLayout>
      </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
