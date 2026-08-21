"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LivePulse } from "./icons";
import type { ReactNode } from "react";

type GameCardProps = {
  href: string;
  title: string;
  tagline: string;
  players: number;
  accent: string;
  icon: ReactNode;
  disabled?: boolean;
};

export function GameCard({ href, title, tagline, players, accent, icon, disabled }: GameCardProps) {
  const content = (
    <motion.div
      whileHover={disabled ? undefined : { y: -6, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl panel-glass p-5 h-full ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.02) inset` }}
    >
      <div
        className="pointer-events-none absolute -inset-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${accent}22, transparent 60%)`
        }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: `${accent}14`, border: `1px solid ${accent}33` }}
        >
          {icon}
        </div>
        {!disabled && (
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-black/30 px-2.5 py-1">
            <LivePulse />
            <span className="font-mono text-xs text-dim">{players} online</span>
          </div>
        )}
        {disabled && (
          <span className="rounded-full border border-border bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-wide text-dim">
            SOON
          </span>
        )}
      </div>

      <h3 className="relative mt-4 font-display text-lg font-bold tracking-wide" style={{ color: accent }}>
        {title}
      </h3>
      <p className="relative mt-1 text-sm text-dim">{tagline}</p>

      {!disabled && (
        <div className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Play now
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
            &rarr;
          </motion.span>
        </div>
      )}
    </motion.div>
  );

  if (disabled) return <div>{content}</div>;
  return <Link href={href}>{content}</Link>;
}
