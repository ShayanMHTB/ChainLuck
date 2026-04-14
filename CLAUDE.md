# CLAUDE.md — ChainLuck (AI-assisted development)

Operational guide for Claude Code. **The source of truth for *direction* is `INSTRUCTIONS.md`**
(the project charter). The five docs (README, ARCHITECTURE, BLOCKCHAIN, DEPLOYMENT, FRONTEND)
describe the **old** design — reference only, superseded by the charter where they conflict.

## Current phase

Phase 1 — **frontend rewrite**. All new work happens in `reactjs/`. Do not build lottery
economics or features beyond what the active prompt explicitly asks for.

## Repo layout

- `hardhat/` — EVM/Solidity contracts. Keep. **Testnet only — never deploy to mainnet.**
- `nextjs/` — OLD frontend. **Do not edit; reference only.** Removed in a later step — do **not**
  delete it yet.
- `reactjs/` — NEW frontend (Vite + React 19 + TS). **All frontend work happens here.**

## Toolchain (pinned via mise — do not change)

- Node `24.15.0`, pnpm `10.33.4`.
- Always use **pnpm**, run through mise: `mise exec -- pnpm ...`. Never npm or yarn.

## Stack

- Vite + React 19 + TypeScript (**strict**).
- Tailwind **v4** via `@tailwindcss/vite` — CSS-first `@theme` in `src/index.css`, single
  `@import "tailwindcss";`. **No `tailwind.config.js`, no PostCSS config.**
- shadcn/ui (`pnpm dlx shadcn@latest init`; React 19 supported in the stable release).
- Routing: **TanStack Router**. Server state/data fetching: **TanStack Query**. Forms: TanStack
  Form (or react-hook-form) + Zod resolver. Tables: TanStack Table (history/leaderboards).
- Client / UI / session state: **Zustand** (not Redux).
- Validation: **Zod** at every boundary.
- Web3: **wagmi v2 + viem**; RainbowKit (or ConnectKit) for wallet UX.
- i18n: i18next + react-i18next if keeping EN/FA (next-intl is gone with Next).

## Hard guardrails (compliance + ethics — non-negotiable)

1. **Config-driven economics.** Prices, tiers, RTP, pool splits, limits, and allowed
   jurisdictions live in config — never hard-coded. The business/legal model is unsettled
   (charter §3/§7).
2. **Honest odds.** No "guaranteed win" / "every ticket wins" copy. The UI must never claim
   better odds than the contract enforces.
3. **Responsible gaming is first-class.** Deposit/stake limits, cooldowns, self-exclusion,
   18+ gate, visible harm-support links. No dependency/addiction mechanics, and no
   "whale/gateway/bait" framing anywhere — code, copy, or names.
4. **Testnet only.** Never wire the app to mainnet. The current contract RNG is pseudo-random
   and unsafe for real money.
5. **No PII in client state.** No wallet addresses or personal data in Zustand/localStorage;
   lottery-result state is ephemeral.
6. **Chain is source of truth.** Supabase (later) is only a cache/index synced from events.

## Conventions

- TS strict; avoid `any`. Zod-validate env vars, forms, decoded contract reads, and API
  responses.
- Generate contract types (wagmi CLI / abitype) — do not hand-maintain ABI objects.
- Functional components + hooks. Path alias `@/* -> ./src/*`.
- Public env vars use the `VITE_` prefix; never commit secrets; keep `.env.example` current.
- Small, reviewable commits. Ask before deleting files or any destructive/irreversible
  operation.

## Commands (after setup, run inside `reactjs/`)

- `mise exec -- pnpm dev` · `build` · `preview` · `lint` · `format`
