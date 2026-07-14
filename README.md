# BJ Coach Pro 🃏

A bilingual (FR/EN) **blackjack basic-strategy & Hi-Lo counting trainer**. Not a gambling game — a
coaching tool that grades every decision against the mathematically correct play and explains *why*.

> **Rules simulated:** 6 decks · dealer stands on soft 17 (S17) · double after split (DAS) ·
> blackjack pays 3:2 · no surrender. The built-in chart and the coaching engine match these rules
> exactly.

Training tool only — **no real money, no account**. Even played perfectly, basic strategy still
leaves the house a ~0.5% edge.

_Made by Raythan._

---

## ✨ Features

- **Play** (`/play`) — a real-table felt: bet with chips, deal, hit / stand / double / split,
  insurance prompt, and a full hand-by-hand debrief. Optional **2–3 simultaneous boxes**.
- **Live coaching** — every decision is compared to basic strategy. *Instant feedback* mode toasts
  the verdict immediately; *Exam* mode holds the debrief until the hand ends, like a real table.
- **Flash drill** (`/drill`) — rapid-fire situations, weighted toward the mistakes you actually make.
- **Strategy chart** (`/strategy`) — the full 6D/S17/DAS chart with a live highlight of your current
  hand, plus a **"guess the cell" quiz** mode.
- **Hi-Lo counting** — an honest multi-deck shoe with **adjustable penetration (50–85%)**, running
  count + true count, and a hidden **count quiz** that periodically checks your running count.
- **Coach report** — accuracy, accuracy-by-category, recurring mistakes, a bankroll sparkline, and a
  copy-to-clipboard summary.
- **Bilingual FR/EN** everywhere, and full `prefers-reduced-motion` support.
- **100% client-side** — no backend, no account. Your session (bankroll, stats, mistakes, settings)
  persists in `localStorage`.

### Screenshot / demo (description)

> The home screen sits on a dark radial **felt-green** table with a brass rail. The header shows the
> brand in `Fraunces` display serif and your bankroll in `IBM Plex Mono`, above a scrollable tab bar.
> On **Play**, cards deal in a staggered cascade onto the felt; a fixed bottom **dock** holds the
> betting chips (tap for a springy bounce) and the coloured action buttons (red Hit, green Stand,
> blue Double, purple Split). After each hand a bottom sheet slides up with a decision-by-decision
> debrief — green ✓ for correct plays, red ✗ with the correct move for mistakes.

---

## 🧱 Tech stack & why

| Concern | Choice | Why |
| --- | --- | --- |
| Build/dev | **Vite + React 18 + TypeScript** | The app is 100% client-side and highly interactive (canvas, game state, animations) with **no server data** — Vite's instant dev + trivial static deploy beat Next.js's SSR/SEO overhead here. |
| Routing | **react-router-dom** | Simple multipage client routing for `/`, `/play`, `/drill`, `/strategy`, `/learn`, `/about`. |
| State | **Zustand + persist** | One shared store across pages (bankroll, stats, mistakes, settings) with no prop-drilling; `persist` middleware writes durable state to `localStorage`. |
| Styling | **Tailwind CSS** + a small ported component layer | Utilities for layout; the intricate table/card/chip visuals keep the original hand-tuned CSS to stay pixel-faithful to the identity. |
| Animation | **Framer Motion** | Card-deal cascade, chip taps, sheet/modal transitions, page fades — all gated by `MotionConfig reducedMotion="user"`. |
| Tests | **Vitest** | Unit tests lock the pure rules engine (`src/lib/engine.ts`) so no refactor can regress strategy. |

The **rules engine is a pure, DOM-free, language-independent module** (`src/lib/engine.ts`) — that's
what makes the strategy testable and guarantees no regression.

---

## 🚀 Getting started

```bash
# install
npm install

# run the dev server (http://localhost:5173)
npm run dev

# run the engine unit tests
npm test          # watch mode
npm run test:run  # single run

# type-check + production build
npm run build

# preview the production build locally
npm run preview
```

Requires Node 18+ (developed on Node 24).

---

## 🗂️ Project structure

```
src/
├── lib/
│   ├── engine.ts        # PURE rules engine: strategy, hand value, Hi-Lo, true count,
│   │                    # situations, honest shoe (adjustable penetration), drill builders
│   ├── engine.test.ts   # Vitest: 60 tests locking the engine's behaviour
│   ├── i18n.ts          # bilingual dictionary + language-parameterised coaching text
│   └── display.ts       # small display helpers
├── store/
│   └── useGame.ts       # Zustand store: full game flow + session stats (+ persist)
├── hooks/
│   └── useT.ts          # language-aware translator hook
├── components/          # Card, Chip, GameTable, Dock, Drill, StrategyChart, StatsReport,
│                        # SettingsSheet, InsuranceModal, CountQuiz, HandSummary, Toast, Layout
├── pages/               # Home, Play, DrillPage, StrategyPage, Learn, About
├── App.tsx              # routes + page transitions
└── main.tsx             # entry
```

## 🧪 What the tests guarantee

`src/lib/engine.test.ts` (60 tests) locks:

- the exact **HARD / SOFT / PAIRS** reference tables (any silent edit fails the suite);
- a curated set of **reference basic-strategy decisions** (16 classics + extras);
- double/split **legality downgrades** (D→H, Ds→S, split-only-when-legal);
- **Hi-Lo** values, deck balance, and running-count sums;
- **true count** math and the half-deck floor;
- **hand value** soft/hard and multi-ace edge cases;
- an **honest shoe**: exact 312-card composition and an **unbiased Fisher–Yates shuffle** verified
  statistically over 10k+ draws (rank frequency ≈ 1/13, no positional bias);
- **drill generators** always producing hands that classify back to the requested situation.

## ☁️ Deployment

Static SPA deployed on **Vercel** (framework preset: Vite). `vercel.json` adds a catch-all rewrite to
`index.html` so client-side routes resolve on direct navigation/refresh. No environment variables —
everything runs in the browser.

---

## ⚖️ Disclaimer

BJ Coach Pro is an **educational training tool**. It uses no real money and does not encourage
gambling. Card counting is legal but casinos may refuse service to counters. Perfect basic strategy
minimises losses; it does not make blackjack a winning game.

_Fait par Raythan · Made by Raythan._
