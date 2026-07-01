"use client";

import { useEffect, useRef, useState } from "react";
import AdsterraAd from "./AdsterraAd";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

// Adsterra Configuration
const ADSTERRA_SIDEBAR_KEY = process.env.NEXT_PUBLIC_ADSTERRA_SIDEBAR_KEY;
const ADSTERRA_SIDEBAR_WIDTH = Number(process.env.NEXT_PUBLIC_ADSTERRA_SIDEBAR_WIDTH || "300");
const ADSTERRA_SIDEBAR_HEIGHT = Number(process.env.NEXT_PUBLIC_ADSTERRA_SIDEBAR_HEIGHT || "250");

const ADSTERRA_BANNER_KEY = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY;
const ADSTERRA_BANNER_MOBILE_KEY = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_MOBILE_KEY;
const ADSTERRA_BANNER_WIDTH = Number(process.env.NEXT_PUBLIC_ADSTERRA_BANNER_WIDTH || "728");
const ADSTERRA_BANNER_HEIGHT = Number(process.env.NEXT_PUBLIC_ADSTERRA_BANNER_HEIGHT || "90");

const ADSTERRA_DOMAIN = process.env.NEXT_PUBLIC_ADSTERRA_DOMAIN || "www.highperformanceformat.com";
const ADSTERRA_FORMAT = (process.env.NEXT_PUBLIC_ADSTERRA_FORMAT || "iframe") as "iframe" | "js";

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
  adType?: "sidebar" | "banner";
};

export default function AdSlot({
  slot,
  format = "auto",
  label = "Advertisement",
  minHeight = 120,
  className = "",
  adType,
}: AdSlotProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile viewport for responsive Adsterra key selector
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine if Adsterra is active for this ad slot
  const isAdsterraActive =
    (adType === "sidebar" && Boolean(ADSTERRA_SIDEBAR_KEY)) ||
    (adType === "banner" && Boolean(ADSTERRA_BANNER_KEY || ADSTERRA_BANNER_MOBILE_KEY));

  // Determine AdSense active state
  const isAdsenseActive = !isAdsterraActive && Boolean(ADSENSE_CLIENT && slot);

  const adsensePushed = useRef(false);

  useEffect(() => {
    if (!isAdsenseActive || adsensePushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adsensePushed.current = true;
    } catch (error) {
      console.error("AdSense push failed", error);
    }
  }, [isAdsenseActive]);

  // Render the Adsterra ad component
  const renderAdsterra = () => {
    if (adType === "sidebar" && ADSTERRA_SIDEBAR_KEY) {
      return (
        <AdsterraAd
          slotKey={ADSTERRA_SIDEBAR_KEY}
          width={ADSTERRA_SIDEBAR_WIDTH}
          height={ADSTERRA_SIDEBAR_HEIGHT}
          format={ADSTERRA_FORMAT}
          domain={ADSTERRA_DOMAIN}
        />
      );
    }

    if (adType === "banner") {
      // Choose mobile key if on mobile and mobile key is provided, else fallback to standard banner key
      const activeBannerKey = (isMobile && ADSTERRA_BANNER_MOBILE_KEY)
        ? ADSTERRA_BANNER_MOBILE_KEY
        : ADSTERRA_BANNER_KEY;

      const activeWidth = isMobile ? 320 : ADSTERRA_BANNER_WIDTH;
      const activeHeight = isMobile ? 50 : ADSTERRA_BANNER_HEIGHT;

      if (activeBannerKey) {
        return (
          <AdsterraAd
            slotKey={activeBannerKey}
            width={activeWidth}
            height={activeHeight}
            format={ADSTERRA_FORMAT}
            domain={ADSTERRA_DOMAIN}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className={`overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] ${className}`}>
      <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      {isAdsterraActive ? (
        <div className="px-3 pb-3 flex justify-center items-center">
          {renderAdsterra()}
        </div>
      ) : isAdsenseActive ? (
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

