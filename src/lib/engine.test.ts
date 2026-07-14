import { describe, it, expect } from 'vitest'
import {
  HARD,
  SOFT,
  PAIRS,
  COLS,
  RANKS,
  SUITS,
  dcol,
  cardValue,
  handValue,
  hiloValue,
  trueCount,
  strategy,
  situ,
  isBlackjack,
  chartCellCode,
  pairCellCode,
  newShoe,
  cutCardRemaining,
  buildFrom,
  drillSitu,
  type Card,
  type Rank,
  type Rng,
  type Action,
} from './engine'

/* Deterministic PRNG so the drill/shoe statistical tests never flake. */
function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const C = (r: Rank, s: '♠' | '♥' | '♦' | '♣' = '♠'): Card => ({ r, s })

/* ============================================================
   1. REFERENCE STRATEGY DATA — exact lock (6D · S17 · DAS)
   These are the tables the user validated. Any silent edit fails here.
   ============================================================ */
describe('strategy tables (locked reference data)', () => {
  it('HARD totals match the validated 6D/S17/DAS chart', () => {
    expect(HARD).toEqual({
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
    })
  })

  it('SOFT totals match the validated chart', () => {
    expect(SOFT).toEqual({
      12: 'HHHHHHHHHH',
      13: 'HHHDDHHHHH',
      14: 'HHHDDHHHHH',
      15: 'HHDDDHHHHH',
      16: 'HHDDDHHHHH',
      17: 'HDDDDHHHHH',
      18: 'STTTTSSHHH',
      19: 'SSSSSSSSSS',
      20: 'SSSSSSSSSS',
    })
  })

  it('PAIRS match the validated chart', () => {
    expect(PAIRS).toEqual({
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
    })
  })

  it('every table row has exactly 10 columns (one per dealer up-card)', () => {
    for (const s of Object.values(HARD)) expect(s).toHaveLength(10)
    for (const s of Object.values(SOFT)) expect(s).toHaveLength(10)
    for (const s of Object.values(PAIRS)) expect(s).toHaveLength(10)
    expect(COLS).toHaveLength(10)
  })
})

/* ============================================================
   2. THE 16 REFERENCE STRATEGY CASES (+ a few extra classics)
   Hand-written, human-readable, hard-coded expectations.
   ============================================================ */
describe('reference basic-strategy decisions', () => {
  interface RefCase {
    name: string
    cards: Card[]
    dv: number
    expected: Action
    canDouble?: boolean
    canSplit?: boolean
  }
  const cases: RefCase[] = [
    // hard totals
    { name: 'hard 16 vs 10 → hit (no surrender)', cards: [C('10'), C('6')], dv: 10, expected: 'H' },
    { name: 'hard 16 vs 6 → stand', cards: [C('10'), C('6')], dv: 6, expected: 'S' },
    { name: 'hard 12 vs 2 → hit', cards: [C('10'), C('2')], dv: 2, expected: 'H' },
    { name: 'hard 12 vs 4 → stand', cards: [C('10'), C('2')], dv: 4, expected: 'S' },
    { name: 'hard 12 vs 6 → stand', cards: [C('10'), C('2')], dv: 6, expected: 'S' },
    { name: 'hard 11 vs 10 → double', cards: [C('6'), C('5')], dv: 10, expected: 'D' },
    { name: 'hard 11 vs A → hit (S17 chart)', cards: [C('6'), C('5')], dv: 11, expected: 'H' },
    { name: 'hard 10 vs 10 → hit', cards: [C('6'), C('4')], dv: 10, expected: 'H' },
    { name: 'hard 9 vs 2 → hit', cards: [C('5'), C('4')], dv: 2, expected: 'H' },
    { name: 'hard 9 vs 3 → double', cards: [C('5'), C('4')], dv: 3, expected: 'D' },
    // soft totals
    { name: 'soft 18 (A,7) vs 9 → hit', cards: [C('A'), C('7')], dv: 9, expected: 'H' },
    { name: 'soft 18 (A,7) vs 3 → double (Ds)', cards: [C('A'), C('7')], dv: 3, expected: 'D' },
    { name: 'soft 18 (A,7) vs 7 → stand', cards: [C('A'), C('7')], dv: 7, expected: 'S' },
    { name: 'soft 13 (A,2) vs 5 → double', cards: [C('A'), C('2')], dv: 5, expected: 'D' },
    // pairs
    { name: 'pair 8,8 vs 10 → split (always)', cards: [C('8'), C('8')], dv: 10, expected: 'P' },
    { name: 'pair A,A vs 10 → split (always)', cards: [C('A'), C('A')], dv: 10, expected: 'P' },
    { name: 'pair 9,9 vs 7 → stand (no split)', cards: [C('9'), C('9')], dv: 7, expected: 'S' },
    { name: 'pair 5,5 vs 5 → double (treat as 10)', cards: [C('5'), C('5')], dv: 5, expected: 'D' },
    { name: 'pair 10,10 vs 6 → stand (never split tens)', cards: [C('10'), C('10')], dv: 6, expected: 'S' },
  ]

  it.each(cases)('$name', ({ cards, dv, expected, canDouble = true, canSplit = true }) => {
    expect(strategy(cards, dv, canDouble, canSplit)).toBe(expected)
  })
})

/* ============================================================
   3. STRATEGY RESOLUTION LOGIC (double/split legality downgrades)
   ============================================================ */
describe('strategy resolution logic', () => {
  it('downgrades Double to Hit when doubling is illegal', () => {
    // hard 9 vs 3 is a Double
    expect(strategy([C('5'), C('4')], 3, true, false)).toBe('D')
    expect(strategy([C('5'), C('4')], 3, false, false)).toBe('H')
  })

  it('downgrades Ds (double-else-stand) to Stand when doubling is illegal', () => {
    // soft 18 vs 3 is Ds
    expect(strategy([C('A'), C('7')], 3, true, false)).toBe('D')
    expect(strategy([C('A'), C('7')], 3, false, false)).toBe('S')
  })

  it('only splits when splitting is legal, otherwise plays the underlying hand', () => {
    expect(strategy([C('8'), C('8')], 6, true, true)).toBe('P')
    // 8,8 with no split = hard 16 vs 6 → stand
    expect(strategy([C('8'), C('8')], 6, true, false)).toBe('S')
    // 8,8 with no split = hard 16 vs 10 → hit
    expect(strategy([C('8'), C('8')], 10, true, false)).toBe('H')
  })

  it('never hits a hard 17 or more', () => {
    for (const dv of COLS) expect(strategy([C('10'), C('7')], dv, true, false)).toBe('S')
  })

  it('agrees with the chart-cell code for every hard cell (double allowed)', () => {
    for (let row = 5; row <= 16; row++) {
      COLS.forEach((dv, col) => {
        const code = HARD[row][col]
        const want: Action = code === 'D' ? 'D' : (code as Action)
        // build a non-pair hard hand of this total
        const a = row <= 11 ? 2 : row - 10
        const b = row - a
        const cards = a === b ? [C('2'), C(String(row - 2) as Rank)] : [C(String(a) as Rank), C(String(b) as Rank)]
        // guard: ensure the constructed hand really is this hard total & not a pair
        expect(handValue(cards).total).toBe(row)
        expect(strategy(cards, dv, true, false)).toBe(want)
      })
    }
  })
})

/* ============================================================
   4. HI-LO COUNTING
   ============================================================ */
describe('Hi-Lo counting', () => {
  it('assigns +1 to low cards (2-6)', () => {
    for (const r of ['2', '3', '4', '5', '6'] as Rank[]) expect(hiloValue(C(r))).toBe(1)
  })
  it('assigns 0 to neutral cards (7-9)', () => {
    for (const r of ['7', '8', '9'] as Rank[]) expect(hiloValue(C(r))).toBe(0)
  })
  it('assigns -1 to high cards (10, faces, Ace)', () => {
    for (const r of ['10', 'J', 'Q', 'K', 'A'] as Rank[]) expect(hiloValue(C(r))).toBe(-1)
  })
  it('a full 52-card deck counts to exactly zero (balanced system)', () => {
    let rc = 0
    for (const r of RANKS) for (const s of SUITS) rc += hiloValue({ r, s })
    expect(rc).toBe(0)
  })
  it('running count sums card contributions', () => {
    const seq: Card[] = [C('2'), C('3'), C('10'), C('K'), C('7'), C('5')]
    // +1 +1 -1 -1 0 +1 = +1
    expect(seq.reduce((n, c) => n + hiloValue(c), 0)).toBe(1)
  })
})

/* ============================================================
   5. TRUE COUNT
   ============================================================ */
describe('true count', () => {
  it('divides running count by decks remaining', () => {
    expect(trueCount(6, 156)).toBeCloseTo(2, 5) // 156 cards = 3 decks → 6/3
    expect(trueCount(3, 156)).toBeCloseTo(1, 5)
    expect(trueCount(-4, 104)).toBeCloseTo(-2, 5) // 2 decks → -4/2
  })
  it('floors the divisor at half a deck to avoid end-of-shoe blowups', () => {
    // 13 cards left = 0.25 deck, but divisor floored to 0.5
    expect(trueCount(6, 13)).toBeCloseTo(12, 5)
    expect(trueCount(6, 26)).toBeCloseTo(12, 5)
  })
})

/* ============================================================
   6. HAND VALUE (soft / hard / multi-ace)
   ============================================================ */
describe('hand value', () => {
  it('values Ace as 11 when it does not bust', () => {
    expect(handValue([C('A'), C('6')])).toEqual({ total: 17, soft: true })
  })
  it('demotes Ace to 1 to avoid busting (hard)', () => {
    expect(handValue([C('A'), C('6'), C('10')])).toEqual({ total: 17, soft: false })
  })
  it('handles a pair of Aces as soft 12', () => {
    expect(handValue([C('A'), C('A')])).toEqual({ total: 12, soft: true })
  })
  it('keeps one Ace soft with multiple aces when possible', () => {
    expect(handValue([C('A'), C('A'), C('9')])).toEqual({ total: 21, soft: true })
  })
  it('demotes all aces when needed', () => {
    expect(handValue([C('A'), C('A'), C('9'), C('K')])).toEqual({ total: 21, soft: false })
  })
  it('reports busts as a hard total over 21', () => {
    expect(handValue([C('10'), C('8'), C('7')])).toEqual({ total: 25, soft: false })
  })
  it('card values: faces = 10, Ace = 11', () => {
    expect(cardValue(C('K'))).toBe(10)
    expect(cardValue(C('Q'))).toBe(10)
    expect(cardValue(C('A'))).toBe(11)
    expect(cardValue(C('7'))).toBe(7)
  })
})

/* ============================================================
   7. SITUATION CLASSIFICATION
   ============================================================ */
describe('situ classification', () => {
  it('classifies pairs by pair value', () => {
    expect(situ([C('8'), C('8')], 9)).toEqual({ cat: 'pair', row: 8, col: dcol(9) })
    expect(situ([C('A'), C('A')], 6)).toEqual({ cat: 'pair', row: 11, col: dcol(6) })
    expect(situ([C('K'), C('10')], 6)).toEqual({ cat: 'pair', row: 10, col: dcol(6) })
  })
  it('classifies soft hands by soft total (clamped 12..20)', () => {
    expect(situ([C('A'), C('3')], 5)).toEqual({ cat: 'soft', row: 14, col: dcol(5) })
  })
  it('classifies hard hands by hard total (clamped 5..17)', () => {
    expect(situ([C('10'), C('6')], 9)).toEqual({ cat: 'hard', row: 16, col: dcol(9) })
    expect(situ([C('K'), C('8')], 2)).toEqual({ cat: 'hard', row: 17, col: dcol(2) }) // 18 clamps to 17
  })
  it('dcol maps dealer up-cards to column indices', () => {
    expect(dcol(2)).toBe(0)
    expect(dcol(9)).toBe(7)
    expect(dcol(10)).toBe(8)
    expect(dcol(11)).toBe(9) // Ace
  })
})

/* ============================================================
   8. BLACKJACK DETECTION
   ============================================================ */
describe('isBlackjack', () => {
  it('detects a two-card 21', () => {
    expect(isBlackjack([C('A'), C('K')])).toBe(true)
  })
  it('rejects a 21 that came from a split', () => {
    expect(isBlackjack([C('A'), C('K')], true)).toBe(false)
  })
  it('rejects a three-card 21', () => {
    expect(isBlackjack([C('A'), C('5'), C('5')])).toBe(false)
  })
})

/* ============================================================
   9. CHART CELL CODES
   ============================================================ */
describe('chart cell codes', () => {
  it('pairs show P when splittable', () => {
    expect(pairCellCode(8, dcol(10))).toBe('P')
    expect(pairCellCode(11, dcol(2))).toBe('P')
  })
  it('non-split pairs fall through to the underlying play', () => {
    // 5,5 acts like a hard 10 → double vs 6
    expect(pairCellCode(5, dcol(6))).toBe('D')
    // 10,10 acts like hard 20 → stand
    expect(pairCellCode(10, dcol(6))).toBe('S')
  })
  it('chartCellCode dispatches by category', () => {
    expect(chartCellCode('hard', 16, dcol(10))).toBe('H')
    expect(chartCellCode('soft', 18, dcol(3))).toBe('T') // Ds
    expect(chartCellCode('pair', 8, dcol(10))).toBe('P')
  })
})

/* ============================================================
   10. SHOE — honest composition + unbiased shuffle (10k+ samples)
   ============================================================ */
describe('shoe', () => {
  it('a fresh 6-deck shoe has exactly 312 cards, 24 of each rank, 78 of each suit', () => {
    const shoe = newShoe(6, mulberry32(1))
    expect(shoe).toHaveLength(312)
    const byRank: Record<string, number> = {}
    const bySuit: Record<string, number> = {}
    for (const c of shoe) {
      byRank[c.r] = (byRank[c.r] ?? 0) + 1
      bySuit[c.s] = (bySuit[c.s] ?? 0) + 1
    }
    for (const r of RANKS) expect(byRank[r]).toBe(24)
    for (const s of SUITS) expect(bySuit[s]).toBe(78)
  })

  it('draws 10k cards with an ~expected value distribution (honest, no hidden bias)', () => {
    const rng = mulberry32(42)
    const N = 10000
    let shoe = newShoe(6, rng)
    const byRank: Record<string, number> = {}
    for (let i = 0; i < N; i++) {
      if (shoe.length === 0) shoe = newShoe(6, rng)
      const c = shoe.pop() as Card
      byRank[c.r] = (byRank[c.r] ?? 0) + 1
    }
    // Each of the 13 ranks should appear ~1/13 of the time. Tolerance is generous
    // but far tighter than any real bias would allow.
    for (const r of RANKS) {
      const freq = (byRank[r] ?? 0) / N
      expect(freq).toBeGreaterThan(1 / 13 - 0.02)
      expect(freq).toBeLessThan(1 / 13 + 0.02)
    }
  })

  it('Fisher–Yates shuffle has no positional bias (top/middle/bottom ≈ uniform)', () => {
    const rng = mulberry32(7)
    const N = 8000
    const isTen = (c: Card) => cardValue(c) === 10
    const positions = [0, 155, 311]
    const tenCounts = positions.map(() => 0)
    for (let n = 0; n < N; n++) {
      const shoe = newShoe(6, rng)
      positions.forEach((p, idx) => {
        if (isTen(shoe[p])) tenCounts[idx]++
      })
    }
    // P(ten-value card) = 96/312 ≈ 0.3077, independent of position for a fair shuffle.
    for (const cnt of tenCounts) {
      const freq = cnt / N
      expect(freq).toBeGreaterThan(0.3077 - 0.03)
      expect(freq).toBeLessThan(0.3077 + 0.03)
    }
  })

  it('cutCardRemaining maps penetration to a reshuffle threshold (0.75 ⇒ 78, the original)', () => {
    expect(cutCardRemaining(312, 0.75)).toBe(78) // matches the original fixed threshold
    expect(cutCardRemaining(312, 0.5)).toBe(156)
    expect(cutCardRemaining(312, 0.85)).toBe(46)
    // clamps out-of-range penetration into 0.5..0.85
    expect(cutCardRemaining(312, 0.99)).toBe(cutCardRemaining(312, 0.85))
    expect(cutCardRemaining(312, 0.1)).toBe(cutCardRemaining(312, 0.5))
  })
})

/* ============================================================
   11. DRILL GENERATORS — invariants over many seeded iterations
   ============================================================ */
describe('drill generators', () => {
  it('buildFrom always produces a hand that classifies back to the requested situation', () => {
    const rng = mulberry32(123)
    const targets = [
      { cat: 'pair', row: 8, col: 3 },
      { cat: 'pair', row: 11, col: 9 },
      { cat: 'pair', row: 10, col: 0 },
      { cat: 'soft', row: 17, col: 4 },
      { cat: 'soft', row: 13, col: 8 },
      { cat: 'hard', row: 16, col: 7 },
      { cat: 'hard', row: 9, col: 0 },
      { cat: 'hard', row: 5, col: 5 },
      { cat: 'hard', row: 12, col: 2 },
    ] as const
    for (const target of targets) {
      for (let i = 0; i < 300; i++) {
        const { cards, dv } = buildFrom(target, rng)
        expect(cards).toHaveLength(2)
        expect(COLS).toContain(dv)
        expect(situ(cards, dv)).toEqual(target)
      }
    }
  })

  it('buildFrom hard hands are never accidental pairs and use no aces', () => {
    const rng = mulberry32(555)
    for (let row = 5; row <= 17; row++) {
      for (let i = 0; i < 100; i++) {
        const { cards } = buildFrom({ cat: 'hard', row, col: 0 }, rng)
        expect(cards[0].r).not.toBe('A')
        expect(cards[1].r).not.toBe('A')
        expect(cardValue(cards[0])).not.toBe(cardValue(cards[1]))
        expect(handValue(cards).total).toBe(row)
      }
    }
  })

  it('drillSitu returns a valid deal every time, over many iterations', () => {
    const rng = mulberry32(2024)
    for (let i = 0; i < 5000; i++) {
      const { cards, dv } = drillSitu([], rng)
      expect(cards).toHaveLength(2)
      expect(COLS).toContain(dv)
      const s = situ(cards, dv)
      expect(['hard', 'soft', 'pair']).toContain(s.cat)
    }
  })

  it('drillSitu weights toward past mistakes when a mistake list is provided', () => {
    const rng = mulberry32(99)
    const mistakes = [{ cat: 'pair', row: 8, col: 0 } as const] // 8,8 vs 2
    let reproduced = 0
    for (let i = 0; i < 4000; i++) {
      const { cards, dv } = drillSitu([...mistakes], rng)
      const s = situ(cards, dv)
      if (s.cat === 'pair' && s.row === 8 && s.col === 0) reproduced++
    }
    // ~35% of the time it should draw from the mistake list (which is just this one item).
    expect(reproduced).toBeGreaterThan(4000 * 0.2)
  })
})
