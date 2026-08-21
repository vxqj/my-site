"use client";

import { motion } from "framer-motion";
import { GameCard } from "@/components/GameCard";
import { TerritoryIcon, WordBombIcon, ConnectIcon, LivePulse } from "@/components/icons";

const games = [
  {
    href: "/territory",
    title: "DVC TERRITORY",
    tagline: "Trail-claim tiles, cut off rivals, own the board.",
    players: 24,
    accent: "#8bff6b",
    icon: <TerritoryIcon />
  },
  {
    href: "/word-bomb",
    title: "DVC WORD BOMB",
    tagline: "Type a word with the letters before it blows.",
    players: 31,
    accent: "#ff5c5c",
    icon: <WordBombIcon />
  },
  {
    href: "/connect",
    title: "DVC CONNECT",
    tagline: "Classic 4-in-a-row. Fast rounds, ranked ladder.",
    players: 19,
    accent: "#4cf3ff",
    icon: <ConnectIcon />
  }
];

const comingSoon = ["DVC Royale", "DVC Aim", "DVC Chase"];

export default function Hub() {
  const totalOnline = games.reduce((sum, g) => sum + g.players, 0);

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-16">
      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <LivePulse />
          <span className="font-mono text-xs tracking-widest text-dim">
            {totalOnline} PLAYERS ONLINE RIGHT NOW
          </span>
        </div>
        <h1 className="glow-text font-display text-4xl font-extrabold tracking-[0.15em] sm:text-6xl">
          DVC
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-dim sm:text-base">
          No downloads, no accounts, no waiting. Pick a game, drop in, and see who&rsquo;s actually the best in the room.
        </p>
      </motion.div>

      {/* game grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
        }}
        className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {games.map((g) => (
          <motion.div
            key={g.href}
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
          >
            <GameCard {...g} />
          </motion.div>
        ))}
      </motion.div>

      {/* coming soon strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-16"
      >
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-dim">Cooking next</h2>
        <div className="flex flex-wrap gap-3">
          {comingSoon.map((name) => (
            <span
              key={name}
              className="rounded-full border border-border bg-panel/50 px-4 py-2 text-xs text-dim"
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>

      <footer className="mt-20 text-center font-mono text-[10px] tracking-widest text-dim/60">
        DVC &middot; BUILT FOR THE BACK ROW
      </footer>
    </main>
  );
}
