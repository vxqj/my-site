"use client";

import { motion } from "framer-motion";

type IconProps = {
  size?: number;
  className?: string;
};

/* DVC Territory — claimed tiles expanding outward from a corner */
export function TerritoryIcon({ size = 40, className = "" }: IconProps) {
  const tiles = [
    { x: 4, y: 4, delay: 0 },
    { x: 16, y: 4, delay: 0.1 },
    { x: 4, y: 16, delay: 0.15 },
    { x: 16, y: 16, delay: 0.25 },
    { x: 28, y: 4, delay: 0.3 }
  ];
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className}>
      <rect x="1" y="1" width="42" height="42" rx="9" fill="none" stroke="#2a2f5c" strokeWidth="1.5" />
      {tiles.map((t, i) => (
        <motion.rect
          key={i}
          x={t.x} y={t.y} width="11" height="11" rx="2"
          fill="#8bff6b"
          initial={{ opacity: 0.25, scale: 0.6 }}
          animate={{ opacity: [0.25, 1, 0.7], scale: [0.6, 1, 1] }}
          transition={{ duration: 2.4, delay: t.delay, repeat: Infinity, repeatDelay: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: `${t.x + 5.5}px ${t.y + 5.5}px`, filter: "drop-shadow(0 0 4px #8bff6b)" }}
        />
      ))}
    </svg>
  );
}

/* DVC Word Bomb — fuse burning down to a bomb with letter sparks */
export function WordBombIcon({ size = 40, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className}>
      <circle cx="22" cy="26" r="13" fill="#181d3f" stroke="#ff5c5c" strokeWidth="1.5" />
      <motion.circle
        cx="22" cy="26" r="13" fill="none" stroke="#ff5c5c" strokeWidth="1.5"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.12, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 6px #ff5c5c)" }}
      />
      <path d="M22 13 Q26 9 24 5" fill="none" stroke="#ffcb47" strokeWidth="2" strokeLinecap="round" />
      <motion.circle
        r="2" fill="#ffcb47"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        style={{ offsetPath: "path('M22 13 Q26 9 24 5')", filter: "drop-shadow(0 0 5px #ffcb47)" }}
      />
      <text x="22" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#eef1ff" fontFamily="monospace">AB</text>
    </svg>
  );
}

/* DVC Connect — four discs dropping and stacking with a bounce */
export function ConnectIcon({ size = 40, className = "" }: IconProps) {
  const cols = [
    { cx: 10, color: "#4cf3ff", delay: 0 },
    { cx: 18, color: "#ff5fc4", delay: 0.15 },
    { cx: 26, color: "#4cf3ff", delay: 0.3 },
    { cx: 34, color: "#ffcb47", delay: 0.45 }
  ];
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className}>
      <rect x="2" y="8" width="40" height="30" rx="6" fill="#181d3f" stroke="#2a2f5c" strokeWidth="1.5" />
      {cols.map((c, i) => (
        <motion.circle
          key={i}
          cx={c.cx} r="4"
          fill={c.color}
          initial={{ cy: 2 }}
          animate={{ cy: [2, 30, 27, 30] }}
          transition={{ duration: 1.8, delay: c.delay, repeat: Infinity, repeatDelay: 1.4, times: [0, 0.6, 0.8, 1], ease: "easeIn" }}
          style={{ filter: `drop-shadow(0 0 4px ${c.color})` }}
        />
      ))}
    </svg>
  );
}

/* Small live-pulse dot used for CCU counters */
export function LivePulse({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-lime"
        animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-lime" />
    </span>
  );
}
