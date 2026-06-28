"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import AvatarTears from "@/components/AvatarTears";
import { getAvatarMotion } from "@/lib/avatarMotion";

type AvatarFrameProps = {
  mood: number;
  ariaLabel: string;
  leftArm: ReactNode;
  rightArm: ReactNode;
  torso: ReactNode;
  head: ReactNode;
  brows: ReactNode;
  face: ReactNode;
  mouthColor: string;
};

export default function AvatarFrame({
  mood,
  ariaLabel,
  leftArm,
  rightArm,
  torso,
  head,
  brows,
  face,
  mouthColor,
}: AvatarFrameProps) {
  const m = getAvatarMotion(mood);

  return (
    <motion.svg
      viewBox="0 0 240 300"
      role="img"
      aria-label={ariaLabel}
      className="h-full max-h-[430px] w-full max-w-[300px]"
      initial={false}
    >
      <motion.g animate={m.body} transformOrigin="120px 150px">
        <ellipse cx="120" cy="278" rx="54" ry="10" fill="rgba(0,0,0,0.28)" />

        <motion.g animate={m.leftArm} transformOrigin="80px 155px">
          {leftArm}
        </motion.g>
        <motion.g animate={m.rightArm} transformOrigin="160px 155px">
          {rightArm}
        </motion.g>

        {torso}
        {head}

        <motion.g animate={m.brow} transformOrigin="120px 88px">
          {brows}
        </motion.g>
        {face}

        <motion.path
          animate={{ d: m.mouthPath }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          stroke={mouthColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        <AvatarTears tears={m.tears} magnitude={m.magnitude} />
      </motion.g>
    </motion.svg>
  );
}
