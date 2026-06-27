"use client";

import { motion, Variants } from "framer-motion";
import type { AvatarState } from "@/components/RonaldoAvatar";

type MessiAvatarProps = {
  state: AvatarState;
};

const bodyVariants: Variants = {
  neutral: { y: 0, rotate: 0, scale: 1 },
  winning: {
    y: [0, -8, 0],
    rotate: 0,
    scale: 1.02,
    transition: { repeat: Infinity, duration: 1.15, ease: "easeInOut" },
  },
  dominant: {
    y: [0, -7, 0],
    rotate: [0, 360],
    scale: 1.04,
    transition: { repeat: Infinity, duration: 1.7, ease: "easeInOut" },
  },
  losing: { y: 8, rotate: 2, scale: 0.98 },
  losingBig: {
    y: [8, 14, 8],
    rotate: 5,
    scale: 0.97,
    transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
  },
};

const leftArmVariants: Variants = {
  neutral: { rotate: -6, x: 0, y: 0 },
  winning: { rotate: -140, x: -14, y: -18 },
  dominant: { rotate: -152, x: -16, y: -22 },
  losing: { rotate: 20, x: 3, y: 14 },
  losingBig: { rotate: 26, x: 4, y: 18 },
};

const rightArmVariants: Variants = {
  neutral: { rotate: 6, x: 0, y: 0 },
  winning: { rotate: 140, x: 14, y: -18 },
  dominant: { rotate: 152, x: 16, y: -22 },
  losing: { rotate: -20, x: -3, y: 14 },
  losingBig: { rotate: -26, x: -4, y: 18 },
};

const mouthVariants: Variants = {
  neutral: { d: "M106 103 Q120 110 134 103" },
  winning: { d: "M102 101 Q120 121 138 101" },
  dominant: { d: "M100 100 Q120 124 140 100" },
  losing: { d: "M107 113 Q120 106 133 113" },
  losingBig: { d: "M106 115 Q120 106 134 115" },
};

const browVariants: Variants = {
  neutral: { y: 0, rotate: 0 },
  winning: { y: -1, rotate: 2 },
  dominant: { y: -3, rotate: 3 },
  losing: { y: 4, rotate: -4 },
  losingBig: { y: 5, rotate: -6 },
};

const tearVariants: Variants = {
  neutral: { opacity: 0, y: 0 },
  winning: { opacity: 0, y: 0 },
  dominant: { opacity: 0, y: 0 },
  losing: { opacity: 0, y: 0 },
  losingBig: {
    opacity: [0, 1, 0],
    y: [0, 32, 56],
    transition: { repeat: Infinity, duration: 1.35, ease: "easeIn" },
  },
};

export default function MessiAvatar({ state }: MessiAvatarProps) {
  return (
    <motion.svg
      viewBox="0 0 240 300"
      role="img"
      aria-label="Cartoon Lionel Messi avatar"
      className="h-full max-h-[430px] w-full max-w-[300px]"
      initial={false}
      animate={state}
    >
      <motion.g variants={bodyVariants} transformOrigin="120px 150px">
        <ellipse cx="120" cy="278" rx="54" ry="10" fill="rgba(0,0,0,0.28)" />

        <motion.g variants={leftArmVariants} transformOrigin="80px 155px">
          <path d="M83 151 C61 172 52 197 45 223" stroke="#e5a178" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="43" cy="227" r="10" fill="#e5a178" />
        </motion.g>
        <motion.g variants={rightArmVariants} transformOrigin="160px 155px">
          <path d="M157 151 C179 172 188 197 195 223" stroke="#e5a178" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="197" cy="227" r="10" fill="#e5a178" />
        </motion.g>

        <path d="M78 144 C82 123 96 112 120 112 C144 112 158 123 162 144 L172 238 C139 252 102 252 68 238 Z" fill="#dff8ff" />
        <path d="M96 118 H112 V244 H96 Z" fill="#74cdf1" opacity="0.95" />
        <path d="M128 118 H144 V244 H128 Z" fill="#74cdf1" opacity="0.95" />
        <path d="M92 124 L120 152 L148 124 L157 145 C137 163 103 163 83 145 Z" fill="#ffffff" opacity="0.98" />
        <text x="120" y="214" textAnchor="middle" fontSize="50" fontWeight="900" fill="#1D9E75" fontFamily="Arial, sans-serif">
          10
        </text>

        <path d="M87 236 L106 236 L103 280 L82 280 Z" fill="#111827" />
        <path d="M134 236 L153 236 L158 280 L137 280 Z" fill="#111827" />
        <path d="M74 280 H109 Q111 292 96 292 H72 Z" fill="#f6f7fb" />
        <path d="M131 280 H166 L168 292 H144 Q129 292 131 280 Z" fill="#f6f7fb" />

        <circle cx="120" cy="79" r="43" fill="#e5a178" />
        <path
          d="M78 76 C81 48 99 32 123 31 C149 30 165 49 166 75 C151 63 128 58 104 64 C96 66 87 70 78 76 Z"
          fill="#6b4a34"
        />
        <path d="M88 58 C104 42 140 42 158 65 C139 56 112 56 88 70 Z" fill="#8a6b55" opacity="0.75" />
        <path d="M92 106 C103 124 137 124 148 106 C146 132 94 132 92 106 Z" fill="#6b3f2d" opacity="0.86" />

        <motion.g variants={browVariants} transformOrigin="120px 88px">
          <path d="M93 86 Q104 81 113 86" stroke="#4d3324" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M127 86 Q137 81 148 86" stroke="#4d3324" strokeWidth="4" strokeLinecap="round" fill="none" />
        </motion.g>
        <circle cx="104" cy="94" r="4" fill="#171717" />
        <circle cx="136" cy="94" r="4" fill="#171717" />
        <path d="M120 94 L115 106 H125 Z" fill="#ca7f5d" />
        <motion.path variants={mouthVariants} stroke="#4d1f1c" strokeWidth="4" strokeLinecap="round" fill="none" />
        <motion.path variants={tearVariants} d="M91 104 C97 113 100 117 100 123 C100 129 96 133 91 133 C86 133 82 129 82 123 C82 117 86 113 91 104 Z" fill="#7dd3fc" />
      </motion.g>
    </motion.svg>
  );
}
