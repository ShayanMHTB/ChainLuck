# ChainLuck — Project Instruction & Rebuild Charter

> The missing top-level instruction for the project. Read this before README/ARCHITECTURE/
> BLOCKCHAIN/FRONTEND — those describe the *old* design; this document defines the
> direction, the non-negotiable constraints, and the rebuild plan that supersede them where
> they conflict.

---

## 1. What this project is

An on-chain, instant-result lottery (scratch-off style). A user connects a wallet, pays a
stablecoin stake on a low-fee network, gets an immediate provably-fair result, and is paid
out on the spot. The user covers network fees.

**The actual moat — protect it above everything:** *provably-fair, auditable odds with
instant settlement.* A traditional lottery cannot prove it didn't pre-pick winners. We can.
Every design decision should reinforce "anyone can verify the odds and the payout on-chain,"
because that is the one thing we can do that incumbents structurally cannot.

**Current state (inherited):**
- Solidity contract (multi-tier ticket purchase, instant win calc) on Hardhat — EVM.
- A partially-built Next.js frontend (wallet connect → pick tickets → animate → pay out).
- Extensive docs describing a 3-tier ($1/$2/$5) model with referral, daily check-in, and
  special-lottery systems.
- Never finished. Being re-evaluated for a proper relaunch.

---

## 2. Hard constraints (non-negotiable — resolve these before writing relaunch code)

These exist because getting them wrong ends the project, not because of style preference.

### 2.1 Legal-first, not legal-later
- Online lotteries are regulated gambling almost everywhere. In **Switzerland** (operator's
  base) they are "large-scale games" requiring a GESPA permit; lottery permits are capped and
  held only by Swisslos and Loterie Romande — *new ones are not available*. Other online
  gambling licences require an existing Swiss land-based casino. Crypto isn't banned in
  principle but has not been approved in practice for licensed gambling. Unlicensed operation
  risks fines up to CHF 500,000, prison, network-blocking, and public blacklisting. "It's
  decentralized" is **not** a defense; the regulator already applies the framework to Web3.
- **Action gate:** a 1-hour consult with a Swiss gaming lawyer *before any mainnet
  deployment.* Pick ONE structural path (see §3) and design to it from day one.
- Build geoblocking + jurisdiction logic as a first-class feature, not an afterthought.

### 2.2 Truthful odds
- No "every ticket wins" / "guaranteed returns" framing for what is a partial rebate.
- Publish a real, honest **Return-To-Player (RTP)**. Target RTP ≥ 70% to be a defensible
  product. The old docs imply ~25% RTP (≈75% house edge) — roughly half of a state lottery.
  On-chain transparency makes a punitive edge *visible*; honesty here is a feature, not a cost.
- The contract is the source of truth for odds and payouts; the UI must never claim better
  odds than the contract enforces. Validate this in tests.

### 2.3 Responsible gaming is built in, not bolted on
- Required from v1: age/identity gating where applicable, deposit/stake limits, cooldowns,
  self-exclusion, and visible links to gambling-harm support.
- Retention features (streaks, referrals, special draws) are allowed **only** as engagement,
  with these guardrails active. We do not design mechanics whose purpose is dependency.
- Remove the "gateway drug / addiction-building / whale-bait / platform-dependency" framing
  from all docs, copy, and internal naming. Every regime that could license us *mandates the
  opposite*, so this framing is both an ethics problem and a compliance blocker.

---

## 3. Strategic direction (decide, then commit)

Pick a single primary model. Each implies different contract logic, KYC, and marketing.

| Path | What it is | Trade-off |
|---|---|---|
| **A. Licensed market + geoblock** | Operate only where licensable; hard-block CH and other prohibited markets. | Slowest/most expensive; cleanest long-term. |
| **B. Not-legally-gambling** | Sweepstakes / no-purchase-necessary / skill-based structure so it falls outside the gambling definition. | Needs careful legal design; mechanics constrained. |
| **C. White-label engine** | We build the provably-fair tech; a permit-holder operates it. | We sell software, not gambling. Lowest legal risk to us. |

Until this is chosen, treat the contract's economic parameters and the KYC surface as
**unsettled** and keep them config-driven, not hard-coded.

---

## 4. Target architecture

Keep the EVM/Hardhat foundation. Rebuild the frontend.

### 4.1 Chain & contracts (unchanged stack, cleaned model)
- **Hardhat + Solidity** stay. This commits us to **EVM** — Polygon is the natural low-fee
  home (Arbitrum/Base as later options). *Note the conflict:* the founder's prose mentions
  Solana/Tron, but "keep Hardhat" + the existing Solidity codebase mean EVM. Going Solana
  would mean discarding Hardhat for Rust/Anchor — a full contract rewrite. **Open decision.**
- Stablecoin stake (USDC/USDT). All economic constants (price tiers, RTP, pool splits,
  limits) live in contract config so they can be tuned per the chosen legal path.
- Randomness: ship Chainlink VRF for any meaningful prize. The current "enhanced
  pseudo-random" mixes `block.timestamp`/`prevrandao`/`gasleft` — these are
  miner/validator-influenceable and not safe for real money. Pseudo-random is fine only for
  testnet demos.

### 4.2 Frontend (full rewrite — leave Next.js)
A wallet-connected dApp is a client SPA + thin API; RSC/server runtime isn't needed here.

- **Runtime/tooling:** Node 24, Vite, TypeScript (strict).
- **UI:** React 19, Tailwind v4, shadcn/ui.
- **Routing:** TanStack Router (type-safe, pairs cleanly with an SPA).
- **Server state / data fetching:** TanStack Query.
- **Client/session/UI state:** Zustand.
- **Validation:** Zod at every boundary — forms, API responses, and decoded contract reads.
- **Web3:** wagmi v2 + viem; RainbowKit or ConnectKit for wallet UX.
- **Forms:** TanStack Form (or react-hook-form) + Zod resolver.
- Optional: TanStack Table for history/leaderboards.

### 4.3 Backend / data
- Supabase (Postgres) for indexed history, user profiles, referral/streak state, analytics.
- Treat the chain as source of truth; the DB is a cache/index synced from contract events.
- Edge functions for event sync, referral processing, draw operations.

---

## 5. Rebuild plan (suggested phasing)

1. **Decide §3 path + legal consult.** Nothing downstream is stable until this is set.
2. **Contract v2:** clean multi-tier model, honest RTP, VRF, responsible-gaming limits,
   config-driven economics, full test suite (odds match config; RTP is provable).
3. **Frontend foundation:** Vite + React 19 + TS scaffold, Tailwind v4 + shadcn, TanStack
   Router/Query, wagmi/viem, Zustand, Zod. Wallet connect + read contract config.
4. **Core loop:** select tier/tickets → simulate → confirm → buy → animate result → payout,
   with limits and geoblock enforced in the path.
5. **Engagement (guarded):** dashboard, history, referral, streaks — all behind
   responsible-gaming guardrails.
6. **Indexing & analytics:** event sync to Supabase, honest stats surfaces.
7. **Audit + testnet hardening**, then mainnet only after legal sign-off.

---

## 6. How Claude should assist in this project

- Default to helping build a *fair, transparent, compliant* lottery and the new stack above.
- Proactively flag anything that drifts back toward: false "guaranteed win" framing,
  punitive/hidden RTP, dependency-engineering mechanics, or deploying to prohibited markets.
- Will not help tune mechanics whose stated goal is to addict users; will offer the
  responsible-engagement equivalent instead.
- For legal/financial specifics: give the factual picture and defer to a qualified
  professional — not a substitute for the lawyer consult in §2.1.
- Prefer config-driven, well-tested contract code; validate every external boundary with Zod.

---

## 7. Open decisions to resolve next

1. **Legal path:** A (geoblock), B (not-gambling structure), or C (white-label)?
2. **Chain:** Commit to EVM/Polygon (keeps Hardhat), or reopen Solana/Tron (drops Hardhat)?
3. **Honest economics:** target RTP and tier prices under the chosen path.
4. **KYC surface:** how much identity verification the chosen path requires.

Resolve 1 and 2 first — they gate everything else.
