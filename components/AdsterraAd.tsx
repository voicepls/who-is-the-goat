"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
    atAsyncOptions?: Record<string, unknown>[];
  }
}

type AdsterraAdProps = {
  slotKey: string;
  width: number;
  height: number;
  format?: "iframe" | "js";
  domain?: string;
  className?: string;
};

export default function AdsterraAd({
  slotKey,
  width,
  height,
  format = "iframe",
  domain = "www.highperformanceformat.com",
  className = "",
}: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = `atContainer-${slotKey}`;

  useEffect(() => {
    if (!slotKey || !containerRef.current) return;

    // Avoid double injection in React 18 strict mode
    if (containerRef.current.firstChild) return;

    const container = containerRef.current;

    // Ensure domain starts with no protocol
    const cleanDomain = domain.replace(/^(https?:)?\/\//, "");

    if (format === "js") {
      // Async JS format
      const configScript = document.createElement("script");
      configScript.type = "text/javascript";
      configScript.innerHTML = `
        if (typeof window.atAsyncOptions !== 'object') window.atAsyncOptions = [];
        window.atAsyncOptions.push({
          key: '${slotKey}',
          format: 'js',
          async: true,
          container: '${containerId}',
          params: {}
        });
      `;

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.async = true;
      invokeScript.src = `https://${cleanDomain}/${slotKey}/invoke.js`;

      container.appendChild(configScript);
      container.appendChild(invokeScript);
    } else {
      // Standard iframe format
      window.atOptions = {
        key: slotKey,
        format: "iframe",
        height,
        width,
        params: {},
      };

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://${cleanDomain}/${slotKey}/invoke.js`;

      container.appendChild(script);
    }

    return () => {
      // Cleanup on unmount
      container.innerHTML = "";
    };
  }, [slotKey, width, height, format, domain, containerId]);

  return (
    <div
      id={containerId}
      ref={containerRef}
      className={`mx-auto flex items-center justify-center overflow-hidden ${className}`}
      style={{ minWidth: width, minHeight: height }}
    />
  );
}
