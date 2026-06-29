"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import AdSlot from "@/components/AdSlot";

const DISMISS_KEY = "goat_ad_dismissed";

type StickyAdBannerProps = {
  slot?: string;
};

export default function StickyAdBanner({ slot }: StickyAdBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      setVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="goat-sticky-ad fixed inset-x-0 bottom-0 z-40 px-2 pb-2 sm:px-4 sm:pb-4"
        >
          <div className="goat-sticky-ad-shell relative mx-auto max-w-5xl rounded-lg border border-white/10 bg-night/85 p-2 shadow-2xl backdrop-blur sm:rounded-xl">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close advertisement"
              className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-night text-sm text-slate-300 transition hover:text-white"
            >
              ✕
            </button>
            <AdSlot slot={slot} label="Sponsored" minHeight={60} className="border-0 bg-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
