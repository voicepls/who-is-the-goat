"use client";

import { motion } from "framer-motion";
import type { Tear } from "@/lib/avatarMotion";

const EYE_Y = 100;
const DROP = "M0 -2 C3 4 5 7 5 11 a5 5 0 0 1 -10 0 C-5 7 -3 4 0 -2 Z";

type AvatarTearsProps = {
  tears: Tear[];
  magnitude: number;
};

export default function AvatarTears({ tears, magnitude }: AvatarTearsProps) {
  const duration = Math.max(0.85, 1.7 - magnitude);

  return (
    <>
      {tears.map((tear, index) => (
        <motion.path
          key={`${tear.x}-${index}`}
          d={DROP}
          fill="#7dd3fc"
          opacity={0}
          style={{ transformBox: "fill-box" }}
          initial={false}
          animate={{ opacity: [0, 0.95, 0], y: [0, 26, 52], scale: tear.scale }}
          transition={{ repeat: Infinity, duration, ease: "easeIn", delay: tear.delay }}
          transform={`translate(${tear.x} ${EYE_Y})`}
        />
      ))}
    </>
  );
}
