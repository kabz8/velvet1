import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useListFaqs } from "@workspace/api-client-react";

export default function FAQPage() {
  const { data: faqs = [] } = useListFaqs();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ color: "#C26D85", letterSpacing: "0.15em" }}>Got Questions?</p>
        <h1 className="font-display text-5xl font-semibold" style={{ color: "#E7D9C8" }}>FAQ</h1>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="rounded-xl overflow-hidden" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              className="w-full text-left p-6 flex items-center justify-between gap-4"
              onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
            >
              <span className="font-sans font-medium" style={{ color: "#E7D9C8" }}>{faq.question}</span>
              <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-200 ${expanded === faq.id ? "rotate-180" : ""}`} style={{ color: "#A1A1AA" }} />
            </button>
            {expanded === faq.id && (
              <div className="px-6 pb-6">
                <p className="font-sans text-sm leading-relaxed" style={{ color: "#A1A1AA" }}>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: "rgba(111,44,145,0.1)", border: "1px solid rgba(111,44,145,0.2)" }}>
        <h3 className="font-display text-xl mb-2" style={{ color: "#E7D9C8" }}>Still have questions?</h3>
        <p className="font-sans text-sm mb-4" style={{ color: "#A1A1AA" }}>Reach out via WhatsApp for a discreet, personal response.</p>
        <a href="https://wa.me/254700000000" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans font-semibold text-sm" style={{ background: "#6F2C91", color: "#E7D9C8" }}>
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
