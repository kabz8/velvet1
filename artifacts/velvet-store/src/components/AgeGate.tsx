import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAgeGateSettings } from "@workspace/api-client-react";

const AGE_KEY = "velvet_age_confirmed";

export function AgeGate() {
  const [show, setShow] = useState(false);
  const { data: settings } = useGetAgeGateSettings();

  useEffect(() => {
    const confirmed = localStorage.getItem(AGE_KEY);
    if (!confirmed) setShow(true);
  }, []);

  const confirm = () => {
    localStorage.setItem(AGE_KEY, "1");
    setShow(false);
  };

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  const settingsObj = settings && typeof settings === "object" ? settings : {};
  const enabled = (settingsObj as { enabled?: unknown }).enabled;
  const isEnabled = typeof enabled === "boolean" ? enabled : true;
  if (!isEnabled) return null;

  const title = (settingsObj as { title?: string }).title || "Adults Only";
  const message = (settingsObj as { message?: string }).message || "This store contains products intended for adults 18 years of age and older.";
  const confirmLabel = (settingsObj as { confirmLabel?: string }).confirmLabel || "I am 18+, Enter";
  const exitLabel = (settingsObj as { exitLabel?: string }).exitLabel || "Exit";
  const backgroundImageUrl = (settingsObj as { backgroundImageUrl?: string | null }).backgroundImageUrl;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: backgroundImageUrl
              ? `url(${backgroundImageUrl}) center/cover`
              : "linear-gradient(135deg, #0B0B0F 0%, #1A0A2E 50%, #0B0B0F 100%)",
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative z-10 max-w-md w-full mx-6 text-center"
          >
            <div className="mb-8">
              <div className="text-4xl mb-6" style={{ color: "#C26D85" }}>✦</div>
              <h1 className="font-display text-4xl font-semibold mb-2" style={{ color: "#E7D9C8" }}>
                {title}
              </h1>
              <div className="w-16 h-px mx-auto my-5" style={{ background: "#6F2C91" }} />
              <p className="text-base leading-relaxed" style={{ color: "#A1A1AA" }}>
                {message}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={confirm}
                className="w-full py-4 px-8 rounded-lg font-sans font-semibold text-sm tracking-wider uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #6F2C91, #C26D85)",
                  color: "#E7D9C8",
                  letterSpacing: "0.1em",
                }}
              >
                {confirmLabel}
              </button>
              <button
                onClick={exit}
                className="w-full py-3 px-8 rounded-lg font-sans text-sm transition-all duration-200 hover:text-white"
                style={{ color: "#A1A1AA", border: "1px solid rgba(161,161,170,0.3)" }}
              >
                {exitLabel}
              </button>
            </div>

            <p className="mt-8 text-xs" style={{ color: "#A1A1AA", opacity: 0.6 }}>
              By entering, you confirm you are of legal age in your jurisdiction.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
