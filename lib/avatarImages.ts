import type { PlayerKey } from "@/lib/players";

export type AvatarEmotion = "happy" | "sad";
export type AvatarLevel = 20 | 40 | 60 | 80 | 100;

type AvatarImageSet = Record<AvatarEmotion, Record<AvatarLevel, string>>;

const LEVELS: AvatarLevel[] = [20, 40, 60, 80, 100];

const AVATAR_IMAGES: Record<PlayerKey, AvatarImageSet> = {
  ron: {
    happy: {
      20: "/avatars/ronaldo/happy-20.png",
      40: "/avatars/ronaldo/happy-40.png",
      60: "/avatars/ronaldo/happy-60.png",
      80: "/avatars/ronaldo/happy-80.png",
      100: "/avatars/ronaldo/happy-100.png",
    },
    sad: {
      20: "/avatars/ronaldo/sad-20.png",
      40: "/avatars/ronaldo/sad-40.png",
      60: "/avatars/ronaldo/sad-60.png",
      80: "/avatars/ronaldo/sad-80.png",
      100: "/avatars/ronaldo/sad-100.png",
    },
  },
  mes: {
    happy: {
      20: "/avatars/messi/happy-20.png",
      40: "/avatars/messi/happy-40.png",
      60: "/avatars/messi/happy-60.png",
      80: "/avatars/messi/happy-80.png",
      100: "/avatars/messi/happy-100.png",
    },
    sad: {
      20: "/avatars/messi/sad-20.png",
      40: "/avatars/messi/sad-40.png",
      60: "/avatars/messi/sad-60.png",
      80: "/avatars/messi/sad-80.png",
      100: "/avatars/messi/sad-100.png",
    },
  },
};

function levelFromPercent(percent: number): AvatarLevel {
  const normalized = Math.max(0, Math.min(100, percent));
  return LEVELS.find((level) => normalized <= level) ?? 100;
}

export function getPlayerAvatarImage(
  player: PlayerKey,
  playerPercent: number,
  opponentPercent: number,
) {
  const gap = playerPercent - opponentPercent;

  if (Math.abs(gap) < 4) {
    return {
      emotion: "happy" as const,
      level: 20 as const,
      src: AVATAR_IMAGES[player].happy[20],
    };
  }

  const emotion: AvatarEmotion = gap > 0 ? "happy" : "sad";
  const intensityPercent = gap > 0 ? playerPercent : opponentPercent;
  const level = levelFromPercent(intensityPercent);

  return {
    emotion,
    level,
    src: AVATAR_IMAGES[player][emotion][level],
  };
}
