"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { getAvatarMotion } from "@/lib/avatarMotion";

type ImageAvatarProps = {
  src: string;
  sadSrc?: string;
  mood: number;
  alt: string;
  winEmoji?: string;
};

const stageStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "min(100%, 280px)",
  height: "clamp(260px, 34vw, 360px)",
  maxHeight: "430px",
  margin: "0 auto",
  overflow: "hidden",
};

const imageStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  userSelect: "none",
};

export default function ImageAvatar({ src, sadSrc, mood, alt, winEmoji = "🔥" }: ImageAvatarProps) {
  const m = getAvatarMotion(mood);
  const sadness = m.losing ? m.magnitude : 0;

  const filter =
    sadness > 0
      ? `grayscale(${0.6 * sadness}) brightness(${1 - 0.25 * sadness}) blur(${0.6 * sadness}px)`
      : m.winning
        ? `saturate(${1 + 0.25 * m.magnitude})`
        : "none";

  const reaction = m.winning && m.magnitude > 0.6 ? winEmoji : m.losing && m.magnitude > 0.55 ? "😭" : "";
  const tearDuration = Math.max(0.85, 1.7 - m.magnitude);

  return (
    <div className="goat-image-avatar relative flex h-full max-h-[430px] w-full max-w-[300px] items-center justify-center" style={stageStyle}>
      <motion.div animate={m.body} className="goat-image-avatar-inner relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          width={1254}
          height={1254}
          className="goat-image-avatar-img absolute inset-0 h-full w-full select-none object-contain"
          style={{ ...imageStyle, filter: sadSrc ? "none" : filter }}
        />

        {sadSrc && (
          <motion.img
            src={sadSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            width={1254}
            height={1254}
            className="absolute inset-0 h-full w-full select-none object-contain"
            style={imageStyle}
            animate={{ opacity: sadness }}
            transition={{ duration: 0.4 }}
          />
        )}

        {m.tears.map((tear, index) => (
          <motion.span
            key={index}
            className="absolute block h-3 w-2 rounded-b-full bg-sky-300"
            style={{ left: `${(tear.x / 240) * 100}%`, top: "40%", transform: "translateX(-50%)" }}
            initial={false}
            animate={{ opacity: [0, 0.95, 0], y: [0, 34, 60] }}
            transition={{ repeat: Infinity, duration: tearDuration, ease: "easeIn", delay: tear.delay }}
          />
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {reaction && (
          <motion.span
            key={reaction}
            className="pointer-events-none absolute top-0 text-4xl"
            initial={{ opacity: 0, y: 10, scale: 0.6 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {reaction}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
