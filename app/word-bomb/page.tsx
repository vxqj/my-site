"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { isRealWord, WORD_SET } from "@/lib/wordlist";

const BIGRAMS = [
  "an", "in", "th", "er", "on", "at", "en", "es", "ar", "or",
  "ea", "re", "st", "le", "ti", "ou", "al", "de", "ll", "nd",
  "ow", "ch", "sh", "ne", "ce", "ur", "gr", "br", "fr", "tr"
];

const START_TIME = 10;
const MIN_TIME = 4.5;

function pickBigram(exclude: string[]) {
  const pool = BIGRAMS.filter((b) => !exclude.includes(b));
  return pool[Math.floor(Math.random() * pool.length)] || BIGRAMS[0];
}

export default function WordBombGame() {
  const [status, setStatus] = useState<"idle" | "playing" | "dead">("idle");
  const [bigram, setBigram] = useState(BIGRAMS[0]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [shake, setShake] = useState(0);
  const [used, setUsed] = useState<string[]>([]);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [online, setOnline] = useState(31);
  const inputRef = useRef<HTMLInputElement>(null);
  const usedBigrams = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setOnline((p) => Math.max(14, p + Math.round((Math.random() - 0.5) * 3))), 2500);
    return () => clearInterval(iv);
  }, []);

  const startRound = useCallback((seedStreak: number) => {
    const nextTime = Math.max(MIN_TIME, START_TIME - seedStreak * 0.3);
    const b = pickBigram(usedBigrams.current.slice(-6));
    usedBigrams.current.push(b);
    setBigram(b);
    setInput("");
    setTimeLeft(nextTime);
    setRound((r) => r + 1);
    inputRef.current?.focus();
  }, []);

  const startGame = useCallback(() => {
    setStreak(0);
    setUsed([]);
    usedBigrams.current = [];
    setStatus("playing");
    startRound(0);
  }, [startRound]);

  useEffect(() => {
    if (status !== "playing") return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.08) {
          window.clearInterval(timerRef.current!);
          setStatus("dead");
          setBest((b) => Math.max(b, streak));
          return 0;
        }
        return t - 0.08;
      });
    }, 80);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [status, round, streak]);

  function submit() {
    if (status !== "playing") return;
    const word = input.trim().toLowerCase();
    if (word.length < 2 || !word.includes(bigram) || !isRealWord(word) || used.includes(word)) {
      setFlash("bad");
      setShake((s) => s + 1);
      setTimeout(() => setFlash(null), 220);
      return;
    }
    setFlash("good");
    setUsed((u) => [...u, word]);
    setTimeout(() => setFlash(null), 220);
    const newStreak = streak + 1;
    setStreak(newStreak);
    startRound(newStreak);
  }

  const pct = (timeLeft / START_TIME) * 100;
  const urgent = timeLeft < 3;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-dim hover:text-white transition-colors">&larr; DVC HUB</Link>
        <div className="flex items-center gap-2 font-mono text-xs text-dim">
          <span className="inline-flex h-2 w-2 rounded-full bg-lime" /> {online} online
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-wide" style={{ color: "#ff5c5c" }}>
        DVC WORD BOMB
      </h1>
      <p className="mt-1 text-sm text-dim">Type a real word containing the letters below before it detonates.</p>

      <div className="mt-8 flex flex-col items-center">
        {status === "idle" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={startGame}
            className="rounded-full bg-[#ff5c5c] px-8 py-3 font-semibold text-void transition-transform hover:scale-105"
          >
            Start defusing
          </motion.button>
        )}

        {status !== "idle" && (
          <div className="w-full">
            <div className="flex items-center justify-between font-mono text-xs text-dim">
              <span>streak {streak}</span>
              <span>best {best}</span>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${Math.max(0, pct)}%`, backgroundColor: urgent ? "#ff5c5c" : "#ffcb47" }}
                transition={{ ease: "linear", duration: 0.08 }}
                style={{ boxShadow: urgent ? "0 0 12px #ff5c5c" : "0 0 8px #ffcb47" }}
              />
            </div>

            <div className="mt-10 flex flex-col items-center">
              <motion.div
                key={round + status}
                animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #23274f, #12142c)",
                  border: `2px solid ${urgent ? "#ff5c5c" : "#2a2f5c"}`,
                  boxShadow: urgent ? "0 0 30px rgba(255,92,92,0.5)" : "0 0 20px rgba(0,0,0,0.4)"
                }}
              >
                <span className="font-display text-3xl font-extrabold tracking-widest text-white">
                  {bigram.toUpperCase()}
                </span>
              </motion.div>

              <AnimatePresence mode="wait">
                {status === "playing" && (
                  <motion.input
                    key="input"
                    ref={inputRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="type a word..."
                    className="mt-6 w-64 rounded-xl border bg-panel/60 px-4 py-3 text-center font-mono text-lg tracking-wide text-white outline-none transition-colors"
                    style={{
                      borderColor: flash === "bad" ? "#ff5c5c" : flash === "good" ? "#8bff6b" : "#2a2f5c"
                    }}
                  />
                )}
              </AnimatePresence>

              {status === "dead" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex flex-col items-center gap-3"
                >
                  <span className="font-display text-xl font-bold text-[#ff5c5c]">BOOM</span>
                  <span className="font-mono text-xs text-dim">final streak: {streak}</span>
                  <button
                    onClick={startGame}
                    className="rounded-full bg-cyan px-6 py-2 text-xs font-semibold text-void transition-transform hover:scale-105"
                  >
                    Try again
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
