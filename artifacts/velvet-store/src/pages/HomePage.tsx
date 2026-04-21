import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Truck, Shield, Star, ChevronDown } from "lucide-react";
import { useGetFeaturedProducts, useListBanners, useListTestimonials, useListFaqs } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { getImageUrl, formatKES } from "@/lib/utils";
import { getSampleFeaturedProducts } from "@/lib/sampleProducts";

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

function BannerSlider() {
  const { data: bannersData } = useListBanners({ params: {} });
  const banners = Array.isArray(bannersData)
    ? bannersData
    : Array.isArray((bannersData as { banners?: unknown } | undefined)?.banners)
      ? ((bannersData as { banners: typeof bannersData }).banners as unknown[])
      : [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const prev = () => setCurrent(i => (i - 1 + banners.length) % banners.length);
  const next = () => setCurrent(i => (i + 1) % banners.length);

  const fallback = {
    title: "Indulge in Discreet Luxury",
    subtitle: "Premium intimate wellness, delivered with complete discretion",
    ctaLabel: "Shop Collection",
    ctaLink: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=1400",
  };

  const banner = banners[current] || fallback;

  return (
    <div className="relative h-[60vh] min-h-[480px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${getImageUrl(banner.imageUrl || null)})` }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(11,11,15,0.9) 0%, rgba(111,44,145,0.3) 50%, rgba(11,11,15,0.7) 100%)" }} />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div key={current} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="max-w-xl">
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight mb-4" style={{ color: "#E7D9C8" }}>
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p className="font-sans text-lg leading-relaxed mb-8" style={{ color: "#A1A1AA" }}>{banner.subtitle}</p>
            )}
            {banner.ctaLabel && (
              <Link href={(banner.ctaLink as string) || "/shop"}>
                <button className="px-8 py-4 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase transition-all duration-200 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8", letterSpacing: "0.1em" }}>
                  {banner.ctaLabel}
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-20" style={{ background: "rgba(255,255,255,0.05)", color: "#E7D9C8" }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-20" style={{ background: "rgba(255,255,255,0.05)", color: "#E7D9C8" }}>
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: i === current ? "#C26D85" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TrustBadges() {
  const badges = [
    { icon: <Lock size={20} />, title: "Discreet Packaging", desc: "Plain, unmarked packaging every time" },
    { icon: <Truck size={20} />, title: "Kenya-Wide Delivery", desc: "Nairobi KES 300 · Other regions KES 450" },
    { icon: <Shield size={20} />, title: "100% Private", desc: "No sensitive details in billing or emails" },
    { icon: <Star size={20} />, title: "Premium Quality", desc: "Body-safe, medical-grade materials only" },
  ];
  return (
    <section className="py-12 border-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(111,44,145,0.15)", color: "#C26D85" }}>
                {b.icon}
              </div>
              <h3 className="font-sans font-semibold text-sm mb-1" style={{ color: "#E7D9C8" }}>{b.title}</h3>
              <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: featuredData } = useGetFeaturedProducts();
  const { data: testimonialsData } = useListTestimonials();
  const { data: faqsData } = useListFaqs();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const featuredFallback = getSampleFeaturedProducts();
  const featured = featuredData && typeof featuredData === "object" ? featuredData : featuredFallback;
  const testimonials = Array.isArray(testimonialsData)
    ? testimonialsData
    : Array.isArray((testimonialsData as { testimonials?: unknown } | undefined)?.testimonials)
      ? ((testimonialsData as { testimonials: typeof testimonialsData }).testimonials as unknown[])
      : [];
  const faqs = Array.isArray(faqsData)
    ? faqsData
    : Array.isArray((faqsData as { faqs?: unknown } | undefined)?.faqs)
      ? ((faqsData as { faqs: typeof faqsData }).faqs as unknown[])
      : [];

  return (
    <div>
      <BannerSlider />
      <TrustBadges />

      {/* Best Sellers */}
      {(featured?.bestSellers?.length ?? 0) > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#C26D85", letterSpacing: "0.15em" }}>Most Loved</p>
              <h2 className="font-display text-4xl font-semibold" style={{ color: "#E7D9C8" }}>Best Sellers</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured?.bestSellers?.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/shop?isBestSeller=true">
                <button className="px-6 py-3 rounded-xl font-sans text-sm transition-colors hover:bg-white/10" style={{ color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.1)" }}>
                  View All Best Sellers
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {(featured?.newArrivals?.length ?? 0) > 0 && (
        <section className="py-16" style={{ background: "rgba(20,20,26,0.5)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#6F2C91", letterSpacing: "0.15em" }}>Just Arrived</p>
              <h2 className="font-display text-4xl font-semibold" style={{ color: "#E7D9C8" }}>New Arrivals</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured?.newArrivals?.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offers */}
      {(featured?.offers?.length ?? 0) > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#C26D85", letterSpacing: "0.15em" }}>Limited Time</p>
              <h2 className="font-display text-4xl font-semibold" style={{ color: "#E7D9C8" }}>Special Offers</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured?.offers?.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discreet delivery section */}
      <section className="py-16 border-y" style={{ background: "linear-gradient(135deg, rgba(111,44,145,0.08), rgba(194,109,133,0.05))", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lock size={40} className="mx-auto mb-6" style={{ color: "#6F2C91" }} />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4" style={{ color: "#E7D9C8" }}>
            Your Privacy is Our Priority
          </h2>
          <p className="font-sans text-base leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: "#A1A1AA" }}>
            Every order is shipped in plain, unmarked packaging with no reference to our store or product contents. Your privacy is maintained at every step — from browsing to delivery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: "Plain Packaging", desc: "Neutral boxes and envelopes with no identifying labels" },
              { title: "Discreet Billing", desc: "Billing statements show only a neutral reference" },
              { title: "Anonymous Checkout", desc: "Optional checkout with no name required" },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: "#E7D9C8" }}>{item.title}</h3>
                <p className="font-sans text-xs" style={{ color: "#A1A1AA" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-semibold" style={{ color: "#E7D9C8" }}>What Our Clients Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map(t => (
                <div key={t.id} className="p-6 rounded-2xl" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#C26D85" style={{ color: "#C26D85" }} />
                    ))}
                  </div>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: "#A1A1AA" }}>"{t.content}"</p>
                  <p className="font-sans text-xs font-semibold" style={{ color: "#E7D9C8" }}>{t.customerAlias}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Preview */}
      {faqs.length > 0 && (
        <section className="py-16" style={{ background: "rgba(20,20,26,0.5)" }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Frequently Asked</h2>
            </div>
            <div className="space-y-3">
              {faqs.slice(0, 4).map(faq => (
                <div key={faq.id} className="rounded-xl overflow-hidden" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    className="w-full text-left p-5 flex items-center justify-between"
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <span className="font-sans text-sm font-medium pr-4" style={{ color: "#E7D9C8" }}>{faq.question}</span>
                    <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-200 ${expandedFaq === faq.id ? "rotate-180" : ""}`} style={{ color: "#A1A1AA" }} />
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-5 pb-5">
                      <p className="font-sans text-sm leading-relaxed" style={{ color: "#A1A1AA" }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/faq">
                <button className="font-sans text-sm transition-colors hover:text-white" style={{ color: "#C26D85" }}>View All FAQs</button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-semibold mb-3" style={{ color: "#E7D9C8" }}>Join Our Inner Circle</h2>
          <p className="font-sans text-sm mb-6" style={{ color: "#A1A1AA" }}>Exclusive offers, new arrivals, and wellness tips — delivered discreetly.</p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500"
              style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" }}
            />
            <button className="px-6 py-3 rounded-xl font-sans font-semibold text-sm whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #6F2C91, #C26D85)", color: "#E7D9C8" }}>
              Subscribe
            </button>
          </div>
          <p className="font-sans text-xs mt-3" style={{ color: "#A1A1AA" }}>Your information is kept strictly private. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
