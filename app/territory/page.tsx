"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ---------- config ---------- */
const GRID = 44;
const CELL = 14;
const TICK_MS = 90;
const BOT_COUNT = 4;

type Dir = { x: number; y: number };
const DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
};

type Player = {
  id: string;
  color: string;
  isBot: boolean;
  alive: boolean;
  head: { x: number; y: number };
  dir: Dir;
  trail: { x: number; y: number }[];
  owned: Set<string>;
  score: number;
};

const PALETTE = ["#4cf3ff", "#ff5fc4", "#ffcb47", "#8bff6b", "#b98bff"];
const key = (x: number, y: number) => `${x},${y}`;

function freshPlayers(): Player[] {
  const corners = [
    { x: 3, y: 3 }, { x: GRID - 4, y: 3 }, { x: 3, y: GRID - 4 },
    { x: GRID - 4, y: GRID - 4 }, { x: Math.floor(GRID / 2), y: 3 }
  ];
  return corners.slice(0, BOT_COUNT + 1).map((c, i) => {
    const owned = new Set<string>();
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) owned.add(key(c.x + dx, c.y + dy));
    return {
      id: i === 0 ? "you" : `bot-${i}`,
      color: PALETTE[i % PALETTE.length],
      isBot: i !== 0,
      alive: true,
      head: { ...c },
      dir: { x: 1, y: 0 },
      trail: [],
      owned,
      score: 9
    };
  });
}

export default function TerritoryGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playersRef = useRef<Player[]>(freshPlayers());
  const [scores, setScores] = useState<{ id: string; color: string; score: number; isBot: boolean }[]>([]);
  const [status, setStatus] = useState<"playing" | "dead" | "won">("playing");
  const [players500, setPlayers500] = useState(24);
  const dirQueue = useRef<Dir>({ x: 1, y: 0 });

  const resetGame = useCallback(() => {
    playersRef.current = freshPlayers();
    dirQueue.current = { x: 1, y: 0 };
    setStatus("playing");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = DIRS[e.key];
      if (!d) return;
      const you = playersRef.current[0];
      if (you.dir.x === -d.x && you.dir.y === -d.y) return; // no 180
      dirQueue.current = d;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setPlayers500((p) => Math.max(12, p + Math.round((Math.random() - 0.5) * 3)));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => tick(), TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function botDecision(p: Player): Dir {
    // simple heuristic: prefer moving toward unclaimed territory, avoid walls/trails
    const options = Object.values(DIRS).filter((d, i, arr) => arr.findIndex(o => o.x===d.x&&o.y===d.y) === i);
    const safe = options.filter((d) => {
      if (p.dir.x === -d.x && p.dir.y === -d.y) return false;
      const nx = p.head.x + d.x, ny = p.head.y + d.y;
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) return false;
      return true;
    });
    if (safe.length === 0) return p.dir;
    const scored = safe.map((d) => {
      const nx = p.head.x + d.x, ny = p.head.y + d.y;
      const unclaimed = p.owned.has(key(nx, ny)) ? 0 : 1;
      return { d, w: unclaimed + Math.random() * 0.6 };
    });
    scored.sort((a, b) => b.w - a.w);
    return scored[0].d;
  }

  function floodFillCapture(p: Player) {
    // mark all trail cells as owned, then flood-fill from edges to find unclaimed exterior,
    // anything not reached and not already owned becomes owned (captures enclosed area)
    p.trail.forEach((c) => p.owned.add(key(c.x, c.y)));
    const outside = new Set<string>();
    const stack: [number, number][] = [];
    for (let x = 0; x < GRID; x++) { stack.push([x, 0]); stack.push([x, GRID - 1]); }
    for (let y = 0; y < GRID; y++) { stack.push([0, y]); stack.push([GRID - 1, y]); }
    while (stack.length) {
      const [x, y] = stack.pop()!;
      const k = key(x, y);
      if (x < 0 || y < 0 || x >= GRID || y >= GRID) continue;
      if (outside.has(k) || p.owned.has(k)) continue;
      outside.add(k);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        const k = key(x, y);
        if (!outside.has(k) && !p.owned.has(k)) p.owned.add(k);
      }
    }
    p.trail = [];
    p.score = p.owned.size;
  }

  function tick() {
    const players = playersRef.current;
    const you = players[0];
    if (you.alive) you.dir = dirQueue.current;

    players.forEach((p) => {
      if (!p.alive) return;
      if (p.isBot) p.dir = botDecision(p);
      p.head = { x: p.head.x + p.dir.x, y: p.head.y + p.dir.y };
    });

    // bounds + trail collisions
    players.forEach((p) => {
      if (!p.alive) return;
      const { x, y } = p.head;
      if (x < 0 || y < 0 || x >= GRID || y >= GRID) { p.alive = false; return; }
      for (const other of players) {
        if (other.trail.some((t) => t.x === x && t.y === y)) { p.alive = false; return; }
        if (other.id !== p.id && other.head.x === x && other.head.y === y && other.alive) { p.alive = false; other.alive = false; return; }
      }
    });

    players.forEach((p) => {
      if (!p.alive) return;
      const onOwn = p.owned.has(key(p.head.x, p.head.y));
      if (!onOwn) {
        p.trail.push({ ...p.head });
      } else if (p.trail.length > 0) {
        floodFillCapture(p);
      }
    });

    setScores(players.map((p) => ({ id: p.id, color: p.color, score: p.score, isBot: p.isBot })));

    if (!you.alive) setStatus("dead");
    else if (players.filter((p) => p.alive && p.isBot).length === 0) setStatus("won");

    draw();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a0c1f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const players = playersRef.current;
    players.forEach((p) => {
      ctx.fillStyle = p.color + "33";
      p.owned.forEach((k) => {
        const [x, y] = k.split(",").map(Number);
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      });
    });
    players.forEach((p) => {
      ctx.fillStyle = p.color + "88";
      p.trail.forEach((t) => ctx.fillRect(t.x * CELL, t.y * CELL, CELL, CELL));
    });
    players.forEach((p) => {
      if (!p.alive) return;
      ctx.save();
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.head.x * CELL + 1, p.head.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.restore();
    });
  }

  useEffect(() => { draw(); }, []);

  const you = scores.find((s) => s.id === "you");
  const rank = [...scores].sort((a, b) => b.score - a.score).findIndex((s) => s.id === "you") + 1;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-dim hover:text-white transition-colors">&larr; DVC HUB</Link>
        <div className="flex items-center gap-2 font-mono text-xs text-dim">
          <span className="inline-flex h-2 w-2 rounded-full bg-lime" /> {players500} online
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-wide" style={{ color: "#8bff6b" }}>
        DVC TERRITORY
      </h1>
      <p className="mt-1 text-sm text-dim">WASD / arrows to move. Enclose space to claim it. Don&rsquo;t hit a trail.</p>

      <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row">
        <div className="relative rounded-xl border border-border bg-panel/60 p-2">
          <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} className="rounded-lg" />
          {status !== "playing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-2 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/80 backdrop-blur-sm"
            >
              <span className="font-display text-xl font-bold" style={{ color: status === "won" ? "#8bff6b" : "#ff5c5c" }}>
                {status === "won" ? "TERRITORY SECURED" : "ELIMINATED"}
              </span>
              <span className="font-mono text-xs text-dim">rank #{rank || "-"} &middot; {you?.score ?? 0} tiles</span>
              <button
                onClick={resetGame}
                className="rounded-full bg-cyan px-5 py-2 text-xs font-semibold text-void transition-transform hover:scale-105"
              >
                Play again
              </button>
            </motion.div>
          )}
        </div>

        <div className="w-full max-w-[220px]">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-dim">Leaderboard</h2>
          <div className="space-y-2">
            {[...scores].sort((a, b) => b.score - a.score).map((s, i) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-panel/50 px-3 py-2">
                <span className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.id === "you" ? "You" : `Bot ${i + 1}`}
                </span>
                <span className="font-mono text-xs text-dim">{s.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
