/* ================================================================
   BJ COACH PRO — pure rules engine
   Rules: 6 decks · dealer stands on soft 17 (S17) · DAS · BJ 3:2 · no surrender
   ----------------------------------------------------------------
   This module is 100% DOM-free and language-independent so it can be
   unit-tested in isolation. All display/i18n concerns live elsewhere.
   ================================================================ */

export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type Suit = '♠' | '♥' | '♦' | '♣'
export interface Card {
  r: Rank
  s: Suit
}

/** Resolved player action. */
export type Action = 'H' | 'S' | 'D' | 'P'
/** Raw strategy-table code. `T` = "double if allowed, else stand" (Ds). */
export type Code = 'H' | 'S' | 'D' | 'P' | 'T'
export type Category = 'hard' | 'soft' | 'pair'

export interface HandValue {
  total: number
  soft: boolean
}
export interface Situation {
  cat: Category
  row: number
  col: number
}

/** Injectable RNG so drills/shoe can be tested deterministically. Defaults to Math.random. */
export type Rng = () => number

/* ==================== STRATEGY DATA (6D · S17 · DAS · no surrender) ==================== */
/** Dealer up-card columns. 11 represents an Ace. */
export const COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const

/** Hard totals 5..17 (17 means "17 or more"). Each string is one code per column in COLS order. */
export const HARD: Record<number, string> = {
  5: 'HHHHHHHHHH',
  6: 'HHHHHHHHHH',
  7: 'HHHHHHHHHH',
  8: 'HHHHHHHHHH',
  9: 'HDDDDHHHHH',
  10: 'DDDDDDDDHH',
  11: 'DDDDDDDDDH',
  12: 'HHSSSHHHHH',
  13: 'SSSSSHHHHH',
  14: 'SSSSSHHHHH',
  15: 'SSSSSHHHHH',
  16: 'SSSSSHHHHH',
  17: 'SSSSSSSSSS',
}

/** Soft totals (A + n). Key is the soft total (13..20). `T` = Ds (double else stand). */
export const SOFT: Record<number, string> = {
  12: 'HHHHHHHHHH',
  13: 'HHHDDHHHHH',
  14: 'HHHDDHHHHH',
  15: 'HHDDDHHHHH',
  16: 'HHDDDHHHHH',
  17: 'HDDDDHHHHH',
  18: 'STTTTSSHHH',
  19: 'SSSSSSSSSS',
  20: 'SSSSSSSSSS',
}

/** Pair splitting. Key is the pair card value (11 = Aces, 10 = tens). `Y` = split. */
export const PAIRS: Record<number, string> = {
  2: 'YYYYYYNNNN',
  3: 'YYYYYYNNNN',
  4: 'NNNYYNNNNN',
  5: 'NNNNNNNNNN',
  6: 'YYYYYNNNNN',
  7: 'YYYYYYNNNN',
  8: 'YYYYYYYYYY',
  9: 'YYYYYNYYNN',
  10: 'NNNNNNNNNN',
  11: 'YYYYYYYYYY',
}

export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const SUITS: Suit[] = ['♠', '♥', '♦', '♣']

const TEN_RANKS: Rank[] = ['10', 'J', 'Q', 'K']

/** Index into a strategy string for a given dealer up-card value (2..11). */
export const dcol = (v: number): number => (v >= 10 ? (v === 11 ? 9 : 8) : v - 2)

/* ==================== HAND MATH ==================== */
/** Blackjack value of a single card (Ace = 11, faces = 10). */
export const cardValue = (c: Card): number =>
  c.r === 'A' ? 11 : TEN_RANKS.includes(c.r) ? 10 : Number(c.r)

/** Best total for a hand plus whether it is still "soft" (an Ace counts as 11). */
export function handValue(cards: Card[]): HandValue {
  let total = 0
  let aces = 0
  for (const c of cards) {
    total += cardValue(c)
    if (c.r === 'A') aces++
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return { total, soft: aces > 0 }
}

/** Hi-Lo running-count contribution of a card: low (2-6) +1, neutral (7-9) 0, high (10/faces/A) -1. */
export const hiloValue = (c: Card): number => {
  const v = cardValue(c)
  return v >= 10 ? -1 : v <= 6 ? 1 : 0
}

/** True count = running count divided by decks remaining (floored at half a deck to avoid blowups). */
export const trueCount = (rc: number, cardsLeft: number): number =>
  rc / Math.max(cardsLeft / 52, 0.5)

/**
 * Basic-strategy decision for the current hand.
 * @param cards      the player's current cards
 * @param dv         dealer up-card value (2..11, 11 = Ace)
 * @param canDouble  whether doubling is currently legal
 * @param canSplit   whether splitting is currently legal
 * @returns the resolved action H/S/D/P
 */
export function strategy(cards: Card[], dv: number, canDouble: boolean, canSplit: boolean): Action {
  const col = dcol(dv)
  if (cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1])) {
    if (PAIRS[cardValue(cards[0])][col] === 'Y' && canSplit) return 'P'
  }
  const { total, soft } = handValue(cards)
  let code: string
  if (soft) {
    code = total >= 21 ? 'S' : (SOFT[Math.max(12, total)] || 'SSSSSSSSSS')[col]
  } else {
    code = total >= 17 ? 'S' : total <= 5 ? 'H' : HARD[total][col]
  }
  if (code === 'D') return canDouble ? 'D' : 'H'
  if (code === 'T') return canDouble ? 'D' : 'S'
  return code as Action
}

/** Structured, language-independent situation used for mistake tracking and drills. */
export function situ(cards: Card[], dv: number): Situation {
  const col = dcol(dv)
  if (cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1])) {
    return { cat: 'pair', row: cardValue(cards[0]), col }
  }
  const { total, soft } = handValue(cards)
  if (soft) return { cat: 'soft', row: Math.min(Math.max(total, 12), 20), col }
  return { cat: 'hard', row: Math.min(Math.max(total, 5), 17), col }
}

/** Is this a natural blackjack (two cards totalling 21, not resulting from a split)? */
export const isBlackjack = (cards: Card[], fromSplit = false): boolean =>
  cards.length === 2 && handValue(cards).total === 21 && !fromSplit

/* ==================== CHART DISPLAY CODES (pure) ==================== */
/**
 * The raw code to display in a strategy-chart cell.
 * Pairs resolve to `P` when splittable, otherwise fall through to the
 * hard/soft play the two cards would make.
 */
export function pairCellCode(pairValue: number, col: number): Code {
  if (PAIRS[pairValue][col] === 'Y') return 'P'
  const r: Rank = pairValue === 11 ? 'A' : (String(pairValue) as Rank)
  const fake: Card[] = [
    { r, s: '♠' },
    { r, s: '♥' },
  ]
  const a = strategy(fake, COLS[col], true, false)
  if (a === 'D') {
    const { total, soft } = handValue(fake)
    return (soft ? SOFT[Math.max(12, total)][col] : HARD[total][col]) as Code
  }
  return a as Code
}

/** Raw chart-cell code for a hard/soft/pair category, row and column index. */
export function chartCellCode(cat: Category, row: number, col: number): Code {
  if (cat === 'hard') return HARD[row][col] as Code
  if (cat === 'soft') return SOFT[row][col] as Code
  return pairCellCode(row, col)
}

/* ==================== SHOE ==================== */
/**
 * Build and shuffle a fresh multi-deck shoe (honest sampling without replacement:
 * one Fisher–Yates shuffle, then cards are dealt from the top). No hidden bias.
 */
export function newShoe(decks = 6, rng: Rng = Math.random): Card[] {
  const shoe: Card[] = []
  for (let d = 0; d < decks; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) shoe.push({ r, s })
    }
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shoe[i], shoe[j]] = [shoe[j], shoe[i]]
  }
  return shoe
}

/**
 * Number of cards remaining at or below which the shoe should be reshuffled,
 * for a given penetration fraction (0.5..0.85). Higher penetration = deeper
 * deal before the cut card, which makes counting more meaningful.
 */
export function cutCardRemaining(totalCards: number, penetration: number): number {
  const p = Math.min(0.85, Math.max(0.5, penetration))
  return Math.floor(totalCards * (1 - p))
}

/* ==================== DRILL BUILDERS ==================== */
export interface DrillDeal {
  cards: Card[]
  dv: number
}

const pick = <T,>(arr: readonly T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)]

/** Build a concrete two-card deal (plus dealer up-card value) that matches a situation. */
export function buildFrom(si: Situation, rng: Rng = Math.random): DrillDeal {
  const s1 = pick(SUITS, rng)
  const s2 = pick(SUITS, rng)
  let cards: Card[]
  if (si.cat === 'pair') {
    const r: Rank = si.row === 11 ? 'A' : si.row === 10 ? pick(TEN_RANKS, rng) : (String(si.row) as Rank)
    cards = [
      { r, s: s1 },
      { r, s: s2 },
    ]
  } else if (si.cat === 'soft') {
    cards = [
      { r: 'A', s: s1 },
      { r: String(si.row - 11) as Rank, s: s2 },
    ]
  } else {
    let a: number
    let b: number
    do {
      a = 2 + Math.floor(rng() * 9)
      b = si.row - a
    } while (a === b || b < 2 || b > 10)
    const rn = (n: number): Rank => (n === 10 ? pick(TEN_RANKS, rng) : (String(n) as Rank))
    cards = [
      { r: rn(a), s: s1 },
      { r: rn(b), s: s2 },
    ]
  }
  return { cards, dv: COLS[si.col] }
}

/**
 * Pick the next drill situation, weighted toward the player's past mistakes
 * (35% of the time, when any usable mistake exists), otherwise a fresh random
 * situation biased toward the tricky hard 9–16 zone.
 */
export function drillSitu(mistList: Situation[], rng: Rng = Math.random): DrillDeal {
  const usable = mistList.filter((m) => m.cat === 'hard' || m.cat === 'soft' || m.cat === 'pair')
  if (usable.length && rng() < 0.35) {
    return buildFrom(pick(usable, rng), rng)
  }
  const roll = rng()
  let si: Situation
  if (roll < 0.5) {
    // hard 5-17, biased toward the tricky 9-16 zone
    const rows = [9, 10, 11, 12, 13, 14, 15, 16, 9, 10, 11, 12, 13, 14, 15, 16, 5, 6, 7, 8, 17]
    si = { cat: 'hard', row: pick(rows, rng), col: Math.floor(rng() * 10) }
  } else if (roll < 0.75) {
    si = { cat: 'soft', row: 13 + Math.floor(rng() * 8), col: Math.floor(rng() * 10) }
  } else {
    const v = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], rng)
    si = { cat: 'pair', row: v, col: Math.floor(rng() * 10) }
  }
  return buildFrom(si, rng)
}
