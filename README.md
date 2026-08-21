# DVC Hub

Game hub for jarrah.lol. Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's here

- `/` — the hub, with animated game cards and a live "players online" counter (currently simulated client-side, see below)
- `/territory` — DVC Territory, playable now vs 4 bots
- `/word-bomb` — DVC Word Bomb, playable now solo against the clock
- `/connect` — DVC Connect, playable now vs a minimax AI

All three games work standalone right now — no backend required.

## Wiring up real multiplayer (next step)

The "online now" counts on the hub and inside each game are currently simulated
(`Math.random()` jitter) as placeholders for real presence data. To make them real
and let students actually play each other:

1. Add a Supabase project (you already have one for factor.rest — a new project or
   a new schema in the same one both work).
2. Use [Supabase Realtime Presence](https://supabase.com/docs/guides/realtime/presence)
   to track who's on the hub page and inside each game room.
3. For Territory and Connect, swap the bot-decision functions for broadcast events
   over a Realtime channel — the game logic (collision, win detection, capture) doesn't
   need to change, only how player 2+ moves get sourced.
4. Word Bomb can stay mostly solo, or add a shared room where everyone races the
   same bomb — that only needs a shared channel broadcasting the current bigram + a
   leaderboard of who's still alive.

Vercel serverless functions don't hold WebSocket connections, but Supabase Realtime
(or an alternative like PartyKit) runs its own persistent connection layer, so this
still deploys fine on Vercel.

## Deploying

Push to the GitHub repo connected to your Vercel project (same flow as factor.rest) —
it'll auto-deploy on push to main.
