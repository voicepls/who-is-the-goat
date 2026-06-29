"use client";

import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdSlotProps = {
  slot?: string;
  format?: string;
  label?: string;
  minHeight?: number;
  className?: string;
};

export default function AdSlot({
  slot,
  format = "auto",
  label = "Advertisement",
  minHeight = 120,
  className = "",
}: AdSlotProps) {
  const enabled = Boolean(ADSENSE_CLIENT && slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (error) {
      console.error("AdSense push failed", error);
    }
  }, [enabled]);

  return (
    <div className={`overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] ${className}`}>
      <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      {enabled ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="flex items-center justify-center px-3 pb-3 text-xs font-semibold text-slate-500"
          style={{ minHeight }}
        >
          Ad space available
        </div>
      )}
    </div>
  );
}
