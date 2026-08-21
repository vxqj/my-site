"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ROWS = 6;
const COLS = 7;
type Cell = 0 | 1 | 2; // 0 empty, 1 you, 2 bot

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function cloneBoard(b: Cell[][]) {
  return b.map((row) => [...row]);
}

function dropRow(board: Cell[][], col: number) {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === 0) return r;
  return -1;
}

function checkWin(board: Cell[][], player: Cell): number[][] | null {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of dirs) {
        const cells = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return cells;
      }
    }
  }
  return null;
}

function isFull(board: Cell[][]) {
  return board[0].every((c) => c !== 0);
}

function scorePosition(board: Cell[][], player: Cell): number {
  let score = 0;
  const opp: Cell = player === 1 ? 2 : 1;
  const center = board.map((row) => row[Math.floor(COLS / 2)]).filter((c) => c === player).length;
  score += center * 3;

  const lines: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c <= COLS - 4; c++) lines.push([board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]]);
  for (let c = 0; c < COLS; c++) for (let r = 0; r <= ROWS - 4; r++) lines.push([board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]]);
  for (let r = 0; r <= ROWS - 4; r++) for (let c = 0; c <= COLS - 4; c++) lines.push([board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]]);
  for (let r = 0; r <= ROWS - 4; r++) for (let c = 0; c <= COLS - 4; c++) lines.push([board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]]);

  for (const line of lines) {
    const p = line.filter((x) => x === player).length;
    const o = line.filter((x) => x === opp).length;
    const e = line.filter((x) => x === 0).length;
    if (p === 4) score += 100;
    else if (p === 3 && e === 1) score += 8;
    else if (p === 2 && e === 2) score += 2;
    if (o === 3 && e === 1) score -= 9;
  }
  return score;
}

function minimax(board: Cell[][], depth: number, alpha: number, beta: number, maximizing: boolean): [number | null, number] {
  const validCols = [...Array(COLS).keys()].filter((c) => dropRow(board, c) !== -1);
  const winBot = checkWin(board, 2);
  const winYou = checkWin(board, 1);

  if (winBot) return [null, 1_000_000 - (6 - depth)];
  if (winYou) return [null, -1_000_000 + (6 - depth)];
  if (validCols.length === 0) return [null, 0];
  if (depth === 0) return [null, scorePosition(board, 2)];

  if (maximizing) {
    let value = -Infinity;
    let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
    for (const col of validCols) {
      const b2 = cloneBoard(board);
      b2[dropRow(b2, col)][col] = 2;
      const [, v] = minimax(b2, depth - 1, alpha, beta, false);
      if (v > value) { value = v; bestCol = col; }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  } else {
    let value = Infinity;
    let bestCol = validCols[0];
    for (const col of validCols) {
      const b2 = cloneBoard(board);
      b2[dropRow(b2, col)][col] = 1;
      const [, v] = minimax(b2, depth - 1, alpha, beta, true);
      if (v < value) { value = v; bestCol = col; }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  }
}

const COLORS: Record<Cell, string> = { 0: "transparent", 1: "#4cf3ff", 2: "#ff5fc4" };

export default function ConnectGame() {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard());
  const [turn, setTurn] = useState<Cell>(1);
  const [winner, setWinner] = useState<Cell | 0 | -1>(0); // -1 = draw
  const [winCells, setWinCells] = useState<number[][] | null>(null);
  const [thinking, setThinking] = useState(false);
  const [wins, setWins] = useState({ you: 0, bot: 0 });
  const [online, setOnline] = useState(19);

  useEffect(() => {
    const iv = setInterval(() => setOnline((p) => Math.max(8, p + Math.round((Math.random() - 0.5) * 3))), 2600);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (turn !== 2 || winner !== 0) return;
    setThinking(true);
    const t = setTimeout(() => {
      const [col] = minimax(board, 4, -Infinity, Infinity, true);
      if (col !== null) playMove(col, 2);
      setThinking(false);
    }, 450 + Math.random() * 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner]);

  function playMove(col: number, player: Cell) {
    setBoard((prev) => {
      const row = dropRow(prev, col);
      if (row === -1) return prev;
      const next = cloneBoard(prev);
      next[row][col] = player;

      const win = checkWin(next, player);
      if (win) {
        setWinner(player);
        setWinCells(win);
        setWins((w) => player === 1 ? { ...w, you: w.you + 1 } : { ...w, bot: w.bot + 1 });
      } else if (isFull(next)) {
        setWinner(-1);
      } else {
        setTurn(player === 1 ? 2 : 1);
      }
      return next;
    });
  }

  function handleClick(col: number) {
    if (turn !== 1 || winner !== 0 || thinking) return;
    if (dropRow(board, col) === -1) return;
    playMove(col, 1);
  }

  function reset() {
    setBoard(emptyBoard());
    setTurn(1);
    setWinner(0);
    setWinCells(null);
  }

  const isWinCell = useMemo(() => {
    const s = new Set(winCells?.map(([r, c]) => `${r},${c}`) ?? []);
    return (r: number, c: number) => s.has(`${r},${c}`);
  }, [winCells]);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-dim hover:text-white transition-colors">&larr; DVC HUB</Link>
        <div className="flex items-center gap-2 font-mono text-xs text-dim">
          <span className="inline-flex h-2 w-2 rounded-full bg-lime" /> {online} online
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-wide text-cyan">DVC CONNECT</h1>
      <p className="mt-1 text-sm text-dim">Four in a row. You&rsquo;re cyan, the house is magenta.</p>

      <div className="mt-4 flex items-center gap-4 font-mono text-xs text-dim">
        <span>you {wins.you}</span>
        <span>house {wins.bot}</span>
      </div>

      <div className="relative mt-6 inline-block rounded-2xl border border-border bg-panel/60 p-3">
        <div className="grid grid-cols-7 gap-1.5">
          {board[0].map((_, c) => (
            <button
              key={c}
              onClick={() => handleClick(c)}
              disabled={turn !== 1 || winner !== 0 || thinking}
              className="group flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-white/5 disabled:cursor-not-allowed sm:h-12 sm:w-12"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/0 transition-colors group-hover:bg-cyan/60" />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div key={`${r}-${c}`} className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
                <div className="relative h-full w-full rounded-full bg-black/30">
                  <AnimatePresence>
                    {cell !== 0 && (
                      <motion.div
                        initial={{ y: -260, opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        className="absolute inset-0.5 rounded-full"
                        style={{
                          background: COLORS[cell],
                          boxShadow: isWinCell(r, c)
                            ? `0 0 18px ${COLORS[cell]}, 0 0 4px #fff inset`
                            : `0 0 8px ${COLORS[cell]}88`
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 flex min-h-[52px] items-center gap-3">
        {thinking && <span className="font-mono text-xs text-dim">house is thinking…</span>}
        <AnimatePresence>
          {winner !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <span
                className="font-display text-sm font-bold"
                style={{ color: winner === 1 ? "#4cf3ff" : winner === 2 ? "#ff5fc4" : "#7d84b8" }}
              >
                {winner === -1 ? "DRAW" : winner === 1 ? "YOU WIN" : "HOUSE WINS"}
              </span>
              <button
                onClick={reset}
                className="rounded-full bg-cyan px-5 py-2 text-xs font-semibold text-void transition-transform hover:scale-105"
              >
                Rematch
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
