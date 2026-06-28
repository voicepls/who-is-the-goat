"use client";

import AvatarFrame from "@/components/AvatarFrame";

type RonaldoAvatarProps = {
  mood: number;
};

export default function RonaldoAvatar({ mood }: RonaldoAvatarProps) {
  return (
    <AvatarFrame
      mood={mood}
      ariaLabel="Cartoon Cristiano Ronaldo avatar reacting to the live vote"
      mouthColor="#5a1d1c"
      leftArm={
        <>
          <path d="M83 151 C61 170 51 196 45 223" stroke="#f2b287" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="43" cy="227" r="10" fill="#f2b287" />
        </>
      }
      rightArm={
        <>
          <path d="M157 151 C179 170 189 196 195 223" stroke="#f2b287" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="197" cy="227" r="10" fill="#f2b287" />
        </>
      }
      torso={
        <>
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
        </>
      }
      head={
        <>
          <circle cx="120" cy="79" r="43" fill="#f2b287" />
          <path
            d="M78 77 C78 46 98 28 124 28 C151 28 166 47 166 75 C149 61 119 59 91 74 C92 57 103 46 121 39 C100 41 86 53 78 77 Z"
            fill="#1d1b1d"
          />
          <path d="M88 74 C100 56 134 49 162 67 C144 42 100 41 88 74 Z" fill="#2b2a2d" />
        </>
      }
      brows={
        <>
          <path d="M93 86 Q104 80 113 86" stroke="#211b1a" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M127 86 Q137 80 148 86" stroke="#211b1a" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      }
      face={
        <>
          <circle cx="104" cy="93" r="4" fill="#171717" />
          <circle cx="136" cy="93" r="4" fill="#171717" />
          <path d="M120 93 L115 105 H125 Z" fill="#df956f" />
        </>
      }
    />
  );
}
