"use client";

import { motion, Variants } from "framer-motion";

export type AvatarState = "neutral" | "winning" | "dominant" | "losing" | "losingBig";

type RonaldoAvatarProps = {
  state: AvatarState;
};

const bodyVariants: Variants = {
  neutral: { y: 0, rotate: 0, scale: 1 },
  winning: {
    y: [0, -10, 0],
    rotate: 0,
    scale: 1.02,
    transition: { repeat: Infinity, duration: 1.1, ease: "easeInOut" },
  },
  dominant: {
    y: [0, -8, 0],
    rotate: [0, 360],
    scale: 1.04,
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
  },
  losing: { y: 8, rotate: -2, scale: 0.98 },
  losingBig: {
    y: [8, 14, 8],
    rotate: -5,
    scale: 0.97,
    transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
  },
};

const leftArmVariants: Variants = {
  neutral: { rotate: -8, x: 0, y: 0 },
  winning: { rotate: -138, x: -14, y: -18 },
  dominant: { rotate: -150, x: -16, y: -22 },
  losing: { rotate: 20, x: 2, y: 14 },
  losingBig: { rotate: 25, x: 4, y: 18 },
};

const rightArmVariants: Variants = {
  neutral: { rotate: 8, x: 0, y: 0 },
  winning: { rotate: 138, x: 14, y: -18 },
  dominant: { rotate: 150, x: 16, y: -22 },
  losing: { rotate: -20, x: -2, y: 14 },
  losingBig: { rotate: -25, x: -4, y: 18 },
};

const mouthVariants: Variants = {
  neutral: { d: "M105 101 Q120 108 135 101" },
  winning: { d: "M102 99 Q120 120 138 99" },
  dominant: { d: "M100 98 Q120 124 140 98" },
  losing: { d: "M107 112 Q120 104 133 112" },
  losingBig: { d: "M106 114 Q120 104 134 114" },
};

const browVariants: Variants = {
  neutral: { y: 0, rotate: 0 },
  winning: { y: -2, rotate: -3 },
  dominant: { y: -3, rotate: -5 },
  losing: { y: 4, rotate: 4 },
  losingBig: { y: 5, rotate: 6 },
};

const tearVariants: Variants = {
  neutral: { opacity: 0, y: 0 },
  winning: { opacity: 0, y: 0 },
  dominant: { opacity: 0, y: 0 },
  losing: { opacity: 0, y: 0 },
  losingBig: {
    opacity: [0, 1, 0],
    y: [0, 30, 54],
    transition: { repeat: Infinity, duration: 1.35, ease: "easeIn" },
  },
};

export default function RonaldoAvatar({ state }: RonaldoAvatarProps) {
  return (
    <motion.svg
      viewBox="0 0 240 300"
      role="img"
      aria-label="Cartoon Cristiano Ronaldo avatar"
      className="h-full max-h-[430px] w-full max-w-[300px]"
      initial={false}
      animate={state}
    >
      <motion.g variants={bodyVariants} transformOrigin="120px 150px">
        <ellipse cx="120" cy="278" rx="54" ry="10" fill="rgba(0,0,0,0.28)" />

        <motion.g variants={leftArmVariants} transformOrigin="80px 155px">
          <path d="M83 151 C61 170 51 196 45 223" stroke="#f2b287" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="43" cy="227" r="10" fill="#f2b287" />
        </motion.g>
        <motion.g variants={rightArmVariants} transformOrigin="160px 155px">
          <path d="M157 151 C179 170 189 196 195 223" stroke="#f2b287" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="197" cy="227" r="10" fill="#f2b287" />
        </motion.g>

        <path d="M78 144 C82 123 96 112 120 112 C144 112 158 123 162 144 L172 238 C139 252 102 252 68 238 Z" fill="#185FA5" />
        <path d="M92 124 L120 152 L148 124 L157 145 C137 163 103 163 83 145 Z" fill="#f7f7f7" opacity="0.96" />
        <path d="M76 160 C100 172 140 172 164 160 L168 184 C140 198 100 198 72 184 Z" fill="#103F74" opacity="0.78" />
        <text x="120" y="214" textAnchor="middle" fontSize="56" fontWeight="900" fill="#ffffff" fontFamily="Arial, sans-serif">
          7
        </text>

        <path d="M87 236 L106 236 L103 280 L82 280 Z" fill="#16436d" />
        <path d="M134 236 L153 236 L158 280 L137 280 Z" fill="#16436d" />
        <path d="M74 280 H109 Q111 292 96 292 H72 Z" fill="#f6f7fb" />
        <path d="M131 280 H166 L168 292 H144 Q129 292 131 280 Z" fill="#f6f7fb" />

        <circle cx="120" cy="79" r="43" fill="#f2b287" />
        <path
          d="M78 77 C78 46 98 28 124 28 C151 28 166 47 166 75 C149 61 119 59 91 74 C92 57 103 46 121 39 C100 41 86 53 78 77 Z"
          fill="#1d1b1d"
        />
        <path d="M88 74 C100 56 134 49 162 67 C144 42 100 41 88 74 Z" fill="#2b2a2d" />

        <motion.g variants={browVariants} transformOrigin="120px 88px">
          <path d="M93 86 Q104 80 113 86" stroke="#211b1a" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M127 86 Q137 80 148 86" stroke="#211b1a" strokeWidth="4" strokeLinecap="round" fill="none" />
        </motion.g>
        <circle cx="104" cy="93" r="4" fill="#171717" />
        <circle cx="136" cy="93" r="4" fill="#171717" />
        <path d="M120 93 L115 105 H125 Z" fill="#df956f" />
        <motion.path variants={mouthVariants} stroke="#5a1d1c" strokeWidth="4" strokeLinecap="round" fill="none" />
        <motion.path variants={tearVariants} d="M149 103 C155 112 158 116 158 122 C158 128 154 132 149 132 C144 132 140 128 140 122 C140 116 144 112 149 103 Z" fill="#7dd3fc" />
      </motion.g>
    </motion.svg>
  );
}
