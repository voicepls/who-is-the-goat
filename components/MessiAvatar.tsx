"use client";

import AvatarFrame from "@/components/AvatarFrame";

type MessiAvatarProps = {
  mood: number;
};

export default function MessiAvatar({ mood }: MessiAvatarProps) {
  return (
    <AvatarFrame
      mood={mood}
      ariaLabel="Cartoon Lionel Messi avatar reacting to the live vote"
      mouthColor="#4d1f1c"
      leftArm={
        <>
          <path d="M83 151 C61 172 52 197 45 223" stroke="#e5a178" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="43" cy="227" r="10" fill="#e5a178" />
        </>
      }
      rightArm={
        <>
          <path d="M157 151 C179 172 188 197 195 223" stroke="#e5a178" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="197" cy="227" r="10" fill="#e5a178" />
        </>
      }
      torso={
        <>
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
        </>
      }
      head={
        <>
          <circle cx="120" cy="79" r="43" fill="#e5a178" />
          <path
            d="M78 76 C81 48 99 32 123 31 C149 30 165 49 166 75 C151 63 128 58 104 64 C96 66 87 70 78 76 Z"
            fill="#6b4a34"
          />
          <path d="M88 58 C104 42 140 42 158 65 C139 56 112 56 88 70 Z" fill="#8a6b55" opacity="0.75" />
          <path d="M92 106 C103 124 137 124 148 106 C146 132 94 132 92 106 Z" fill="#6b3f2d" opacity="0.86" />
        </>
      }
      brows={
        <>
          <path d="M93 86 Q104 81 113 86" stroke="#4d3324" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M127 86 Q137 81 148 86" stroke="#4d3324" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      }
      face={
        <>
          <circle cx="104" cy="94" r="4" fill="#171717" />
          <circle cx="136" cy="94" r="4" fill="#171717" />
          <path d="M120 94 L115 106 H125 Z" fill="#ca7f5d" />
        </>
      }
    />
  );
}
