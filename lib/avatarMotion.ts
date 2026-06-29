import type { TargetAndTransition } from "framer-motion";

export type Tear = { x: number; delay: number; scale: number };

export type AvatarMotion = {
  magnitude: number;
  winning: boolean;
  losing: boolean;
  body: TargetAndTransition;
  leftArm: TargetAndTransition;
  rightArm: TargetAndTransition;
  brow: TargetAndTransition;
  mouthPath: string;
  tears: Tear[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

const LEFT_EYE_X = 104;
const RIGHT_EYE_X = 136;

function smile(baseY: number, depth: number) {
  return `M104 ${baseY} Q120 ${baseY + depth} 136 ${baseY}`;
}

function frown(baseY: number, depth: number) {
  return `M104 ${baseY} Q120 ${baseY - depth} 136 ${baseY}`;
}

function buildTears(l: number): Tear[] {
  const tears: Tear[] = [];
  if (l < 0.2) return tears;

  const scale = 0.8 + 0.6 * l;
  tears.push({ x: RIGHT_EYE_X, delay: 0, scale });
  if (l >= 0.45) tears.push({ x: LEFT_EYE_X, delay: 0.35, scale });
  if (l >= 0.72) {
    tears.push({ x: RIGHT_EYE_X, delay: 0.7, scale: scale * 1.1 });
    tears.push({ x: LEFT_EYE_X, delay: 1.0, scale: scale * 1.1 });
  }
  return tears;
}

export function getAvatarMotion(mood: number): AvatarMotion {
  const deadzone = 2.5;
  const winning = mood > deadzone;
  const losing = mood < -deadzone;

  const w = clamp(mood / 45, 0, 1);
  const l = clamp(-mood / 45, 0, 1);
  const magnitude = Math.max(w, l);

  if (winning) {
    const yUp = 6 + 16 * w;
    const duration = Math.max(0.7, 1.5 - 0.6 * w);
    const raise = 22 + 128 * w;
    const armYUp = 4 + 18 * w;
    const pump = w > 0.5;
    const armTransition = { repeat: Infinity, duration: duration * 0.6, ease: "easeInOut" as const };

    return {
      magnitude,
      winning: true,
      losing: false,
      body: {
        y: [0, -yUp, 0],
        scale: 1 + 0.05 * w,
        rotate: w > 0.82 ? [0, 360] : 0,
        transition: { repeat: Infinity, duration, ease: "easeInOut" },
      },
      leftArm: {
        rotate: pump ? [-raise, -raise + 16, -raise] : -raise,
        x: -(8 + 8 * w),
        y: -armYUp,
        transition: pump ? armTransition : { duration: 0.5 },
      },
      rightArm: {
        rotate: pump ? [raise, raise - 16, raise] : raise,
        x: 8 + 8 * w,
        y: -armYUp,
        transition: pump ? armTransition : { duration: 0.5 },
      },
      brow: { y: -2 * w, rotate: 0, transition: { duration: 0.4 } },
      mouthPath: smile(100, 8 + 16 * w),
      tears: [],
    };
  }

  if (losing) {
    const drop = 3 + 9 * l;
    const shake = 1 + 5 * l;
    const duration = Math.max(0.22, 0.5 - 0.28 * l);
    const armDown = 8 + 8 * l;

    return {
      magnitude,
      winning: false,
      losing: true,
      body: {
        y: drop,
        x: [0, -shake, shake, 0],
        rotate: [0, -1.5 * l, 1.5 * l, 0],
        scale: 1 - 0.06 * l,
        transition: { repeat: Infinity, duration, ease: "easeInOut" },
      },
      leftArm: { rotate: 8 + 14 * l, x: 1 + 2 * l, y: armDown, transition: { duration: 0.5 } },
      rightArm: { rotate: -(8 + 14 * l), x: -(1 + 2 * l), y: armDown, transition: { duration: 0.5 } },
      brow: { y: 2.5 * l, rotate: 0, transition: { duration: 0.4 } },
      mouthPath: frown(106 + 8 * l, 3 + 11 * l),
      tears: buildTears(l),
    };
  }

  return {
    magnitude: 0,
    winning: false,
    losing: false,
    body: { y: [0, -3, 0], x: 0, rotate: 0, scale: 1, transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
    leftArm: { rotate: -6, x: 0, y: 0, transition: { duration: 0.5 } },
    rightArm: { rotate: 6, x: 0, y: 0, transition: { duration: 0.5 } },
    brow: { y: 0, rotate: 0, transition: { duration: 0.4 } },
    mouthPath: smile(103, 4),
    tears: [],
  };
}
