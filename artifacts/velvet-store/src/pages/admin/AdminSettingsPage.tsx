import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings, useGetShippingSettings, useUpdateShippingSettings, useGetAgeGateSettings, useUpdateAgeGateSettings } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const { data: siteSettings } = useGetSettings();
  const { data: shippingSettings } = useGetShippingSettings();
  const { data: ageGateSettings } = useGetAgeGateSettings();

  const updateSite = useUpdateSettings();
  const updateShipping = useUpdateShippingSettings();
  const updateAgeGate = useUpdateAgeGateSettings();

  const [site, setSite] = useState<any>({});
  const [shipping, setShipping] = useState<any>({});
  const [ageGate, setAgeGate] = useState<any>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => { if (siteSettings) setSite(siteSettings); }, [siteSettings]);
  useEffect(() => { if (shippingSettings) setShipping(shippingSettings); }, [shippingSettings]);
  useEffect(() => { if (ageGateSettings) setAgeGate(ageGateSettings); }, [ageGateSettings]);

  const saveSection = async (section: string) => {
    try {
      if (section === "site") await updateSite.mutateAsync({ data: site, request: { headers } } as any);
      if (section === "shipping") await updateShipping.mutateAsync({ data: shipping, request: { headers } } as any);
      if (section === "agegate") await updateAgeGate.mutateAsync({ data: ageGate, request: { headers } } as any);
      setSaved(section);
      setTimeout(() => setSaved(null), 2000);
    } catch { alert("Failed to save settings"); }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl font-sans text-sm outline-none focus:ring-1 focus:ring-purple-500";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E7D9C8" };
  const labelCls = "block mb-1.5 font-sans text-xs uppercase tracking-wider";
  const labelStyle = { color: "#A1A1AA" };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#14141A", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <h2 className="font-display text-xl font-semibold" style={{ color: "#E7D9C8" }}>{title}</h2>
        <button onClick={() => saveSection(id)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-sm"
          style={{ background: saved === id ? "rgba(34,197,94,0.15)" : "rgba(111,44,145,0.2)", color: saved === id ? "#22C55E" : "#C26D85", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Save size={14} /> {saved === id ? "Saved!" : "Save"}
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="font-sans text-sm" style={{ color: "#E7D9C8" }}>{label}</span>
      <div onClick={() => onChange(!checked)} className="relative w-10 h-6 rounded-full transition-colors cursor-pointer" style={{ background: checked ? "#6F2C91" : "rgba(255,255,255,0.1)" }}>
        <div className="absolute top-1 transition-transform duration-200 w-4 h-4 rounded-full" style={{ background: "#E7D9C8", left: checked ? "1.25rem" : "0.25rem" }} />
      </div>
    </label>
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold" style={{ color: "#E7D9C8" }}>Settings</h1>

      <Section id="site" title="Site Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Store Name</label>
            <input className={inputCls} style={inputStyle} value={site.storeName || ""} onChange={e => setSite((s: any) => ({ ...s, storeName: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Store Email</label>
            <input className={inputCls} style={inputStyle} value={site.storeEmail || ""} onChange={e => setSite((s: any) => ({ ...s, storeEmail: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Store Phone</label>
            <input className={inputCls} style={inputStyle} value={site.storePhone || ""} onChange={e => setSite((s: any) => ({ ...s, storePhone: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>WhatsApp Number</label>
            <input className={inputCls} style={inputStyle} value={site.socialWhatsapp || ""} placeholder="+254700000000" onChange={e => setSite((s: any) => ({ ...s, socialWhatsapp: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={labelStyle}>Announcement Bar Message</label>
            <input className={inputCls} style={inputStyle} value={site.announcementBar || ""} onChange={e => setSite((s: any) => ({ ...s, announcementBar: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={labelStyle}>Footer Text</label>
            <input className={inputCls} style={inputStyle} value={site.footerText || ""} onChange={e => setSite((s: any) => ({ ...s, footerText: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Toggle label="Show Announcement Bar" checked={!!site.announcementBarEnabled} onChange={v => setSite((s: any) => ({ ...s, announcementBarEnabled: v }))} />
            <Toggle label="Cash on Delivery Enabled" checked={!!site.cashOnDeliveryEnabled} onChange={v => setSite((s: any) => ({ ...s, cashOnDeliveryEnabled: v }))} />
          </div>
        </div>
      </Section>

      <Section id="shipping" title="Shipping Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Nairobi County Fee (KES)</label>
            <input type="number" className={inputCls} style={inputStyle} value={shipping.nairobiCountyFee || ""} onChange={e => setShipping((s: any) => ({ ...s, nairobiCountyFee: +e.target.value }))} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Outside Nairobi Fee (KES)</label>
            <input type="number" className={inputCls} style={inputStyle} value={shipping.outsideNairobiFee || ""} onChange={e => setShipping((s: any) => ({ ...s, outsideNairobiFee: +e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Toggle label="Free Shipping Enabled" checked={!!shipping.freeShippingEnabled} onChange={v => setShipping((s: any) => ({ ...s, freeShippingEnabled: v }))} />
            {shipping.freeShippingEnabled && (
              <div className="mt-3">
                <label className={labelCls} style={labelStyle}>Free Shipping Minimum (KES)</label>
                <input type="number" className={inputCls} style={inputStyle} value={shipping.freeShippingMinimum || ""} onChange={e => setShipping((s: any) => ({ ...s, freeShippingMinimum: +e.target.value }))} />
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section id="agegate" title="Age Gate Settings">
        <div className="space-y-4">
          <Toggle label="Age Gate Enabled" checked={!!ageGate.enabled} onChange={v => setAgeGate((s: any) => ({ ...s, enabled: v }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Title</label>
              <input className={inputCls} style={inputStyle} value={ageGate.title || ""} onChange={e => setAgeGate((s: any) => ({ ...s, title: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Confirm Button Label</label>
              <input className={inputCls} style={inputStyle} value={ageGate.confirmLabel || ""} onChange={e => setAgeGate((s: any) => ({ ...s, confirmLabel: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls} style={labelStyle}>Message</label>
              <textarea rows={3} className={inputCls} style={inputStyle} value={ageGate.message || ""} onChange={e => setAgeGate((s: any) => ({ ...s, message: e.target.value }))} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
