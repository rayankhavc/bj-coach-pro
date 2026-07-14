/* ================================================================
   BJ COACH PRO — shared game + session store (Zustand + persist)
   Ported from the original single-file engine. All /play, /drill and
   /strategy pages read and write this single store — no prop drilling.
   Durable fields (settings, bankroll, coaching stats, mistakes) persist
   to localStorage; the live table (shoe, current hand) is transient.
   ================================================================ */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  newShoe,
  cutCardRemaining,
  hiloValue,
  cardValue,
  handValue,
  strategy,
  situ,
  isBlackjack,
  trueCount,
  drillSitu,
  type Card,
  type Action,
  type Situation,
  type Category,
  type DrillDeal,
} from '@/lib/engine'
import { actName, explain, insExpl, tr, type Lang, type TKey } from '@/lib/i18n'

/* ---------- types ---------- */
export type Result = 'win' | 'lose' | 'push' | 'blackjack' | null
export type Phase = 'bet' | 'play' | 'dealer' | 'over'
export type CountMode = 'off' | 'quiz' | 'visible'
export type ToastKind = 'good' | 'bad' | 'info'

export interface Hand {
  cards: Card[]
  bet: number
  done: boolean
  doubled: boolean
  fromSplit: boolean
  splitAces: boolean
  busted: boolean
  result: Result
  box: number
}

export interface Decision {
  cards?: Card[]
  dv?: number
  act: Action | 'take' | 'refuse'
  rec: Action | 'refuse'
  ok: boolean
  hinted: boolean
  ins: boolean
}

export interface Mistake {
  cat: Category | 'ins'
  row?: number
  col?: number
  rec: Action | 'refuse'
  n: number
}

export interface CatStat {
  n: number
  ok: number
}

export interface Sess {
  hands: number
  w: number
  l: number
  p: number
  bj: number
  net: number
  dec: number
  ok: number
  hints: number
  streak: number
  bestStreak: number
  mist: Record<string, Mistake>
  bankHist: number[]
  cat: { hard: CatStat; soft: CatStat; pair: CatStat; ins: CatStat; drill: CatStat }
}

export interface Settings {
  lang: Lang
  coachLive: boolean
  countMode: CountMode
  penetration: number
  decks: number
  boxes: number
}

export interface Toast {
  id: number
  kind: ToastKind
  title: string
  body: string
}

export interface DrillFeedback {
  ok: boolean
  actLabel: string
  ex: string
}

export interface QuizState {
  ans: number
  done: boolean
  rc: number
  tc: number
  diff: number
}

const START_BANK = 1000

const freshSess = (): Sess => ({
  hands: 0,
  w: 0,
  l: 0,
  p: 0,
  bj: 0,
  net: 0,
  dec: 0,
  ok: 0,
  hints: 0,
  streak: 0,
  bestStreak: 0,
  mist: {},
  bankHist: [START_BANK],
  cat: {
    hard: { n: 0, ok: 0 },
    soft: { n: 0, ok: 0 },
    pair: { n: 0, ok: 0 },
    ins: { n: 0, ok: 0 },
    drill: { n: 0, ok: 0 },
  },
})

/* reduced-motion aware delays for dealer pacing */
const reduced = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const stepDelay = () => (reduced() ? 0 : 420)
const firstDelay = () => (reduced() ? 0 : 360)
const summaryDelay = () => (reduced() ? 0 : 550)

export interface GameState {
  /* durable */
  settings: Settings
  bank: number
  sess: Sess
  countStats: { qN: number; qExact: number; qErr: number }
  drillStats: { n: number; ok: number; best: number }

  /* transient runtime */
  shoe: Card[]
  rc: number
  sinceQuiz: number
  nextQuizAt: number
  bet: number
  lastBet: number
  phase: Phase
  lock: boolean
  dealer: Card[]
  hole: boolean
  hands: Hand[]
  active: number
  insBet: number
  roundId: number
  startingBoxes: number
  hintKey: string | null
  roundDecs: Decision[]
  toast: Toast | null

  /* UI prompts */
  insuranceOpen: boolean
  quizOpen: boolean
  quiz: QuizState
  summaryOpen: boolean
  summaryNet: number

  /* drill runtime */
  drillCur: DrillDeal | null
  drillAnswered: boolean
  drillStreak: number
  drillFb: DrillFeedback | null

  /* actions */
  boot: () => void
  t: (k: TKey) => string
  setLang: (l: Lang) => void
  setCoach: (live: boolean) => void
  setCountMode: (m: CountMode) => void
  setPenetration: (p: number) => void
  setBoxes: (n: number) => void
  addChip: (v: number) => void
  clearBet: () => void
  setBet: (v: number) => void
  reloadBank: () => void
  startRound: () => void
  answerInsurance: (take: boolean) => void
  doAction: (a: Action) => void
  hint: () => void
  rebet: () => void
  resetSession: () => void
  showToast: (kind: ToastKind, title: string, body: string) => void
  hideToast: () => void
  openSummary: () => void
  closeSummary: () => void
  quizStep: (d: number) => void
  quizSubmit: () => void
  nextDrill: () => void
  drillAnswer: (a: Action) => void
}

let toastSeq = 0

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /* ----- internal helpers (operate on committed state via get/set) ----- */
      const countActive = () => get().settings.countMode !== 'off'

      const tallyCat = (cat: keyof Sess['cat'], ok: boolean) =>
        set((s) => {
          const c = s.sess.cat[cat]
          return { sess: { ...s.sess, cat: { ...s.sess.cat, [cat]: { n: c.n + 1, ok: c.ok + (ok ? 1 : 0) } } } }
        })

      const tallyStreak = (ok: boolean) =>
        set((s) => {
          const streak = ok ? s.sess.streak + 1 : 0
          return { sess: { ...s.sess, streak, bestStreak: Math.max(s.sess.bestStreak, streak) } }
        })

      const addMistake = (si: Situation, rec: Action) =>
        set((s) => {
          const k = si.cat + ':' + si.row + ':' + si.col
          const prev = s.sess.mist[k]
          const m: Mistake = prev
            ? { ...prev, n: prev.n + 1, rec }
            : { cat: si.cat, row: si.row, col: si.col, rec, n: 1 }
          return { sess: { ...s.sess, mist: { ...s.sess.mist, [k]: m } } }
        })

      const bumpDec = (ok: boolean) =>
        set((s) => ({ sess: { ...s.sess, dec: s.sess.dec + 1, ok: s.sess.ok + (ok ? 1 : 0) } }))

      const recordDecision = (action: Action, hand: Hand) => {
        const s = get()
        const dv = cardValue(s.dealer[0])
        const canD = hand.cards.length === 2 && !hand.splitAces && s.bank >= hand.bet
        const canP =
          hand.cards.length === 2 &&
          cardValue(hand.cards[0]) === cardValue(hand.cards[1]) &&
          s.hands.length < s.startingBoxes + 3 &&
          !hand.splitAces &&
          s.bank >= hand.bet
        const rec = strategy(hand.cards, dv, canD, canP)
        const si = situ(hand.cards, dv)
        const key = s.active + ':' + hand.cards.length
        const hinted = s.hintKey === key
        const ok = action === rec
        set((st) => ({
          roundDecs: [
            ...st.roundDecs,
            { cards: hand.cards.slice(), dv, act: action, rec, ok, hinted, ins: false },
          ],
          hintKey: null,
        }))
        if (!hinted) {
          bumpDec(ok)
          tallyCat(si.cat, ok)
          tallyStreak(ok)
          if (!ok) addMistake(si, rec)
        } else {
          set((st) => ({ sess: { ...st.sess, hints: st.sess.hints + 1 } }))
        }
        if (s.settings.coachLive && !hinted) {
          const ex = explain(hand.cards, dv, rec, s.settings.lang)
          if (ok) get().showToast('good', tr(s.settings.lang, 'goodCall') + actName(action, s.settings.lang), ex)
          else get().showToast('bad', tr(s.settings.lang, 'mistakeT') + actName(rec, s.settings.lang), ex)
        }
      }

      const recordInsurance = (took: boolean) => {
        const s = get()
        const ok = !took
        set((st) => ({
          roundDecs: [
            ...st.roundDecs,
            { ins: true, act: took ? 'take' : 'refuse', rec: 'refuse', ok, hinted: false },
          ],
        }))
        bumpDec(ok)
        tallyCat('ins', ok)
        tallyStreak(ok)
        if (!ok)
          set((st) => {
            const prev = st.sess.mist['ins']
            const m: Mistake = prev ? { ...prev, n: prev.n + 1 } : { cat: 'ins', rec: 'refuse', n: 1 }
            return { sess: { ...st.sess, mist: { ...st.sess.mist, ins: m } } }
          })
        if (s.settings.coachLive) {
          const lang = s.settings.lang
          if (ok) get().showToast('good', tr(lang, 'insGood'), insExpl(lang))
          else get().showToast('bad', tr(lang, 'insBad'), insExpl(lang))
        }
      }

      const revealHole = () =>
        set((s) => {
          if (!s.hole) return {}
          return { hole: false, rc: countActive() ? s.rc + hiloValue(s.dealer[1]) : s.rc }
        })

      const settleBook = () => {
        set((s) => {
          let net = 0
          let { w, l, p, bj } = s.sess
          let bank = s.bank
          for (const h of s.hands) {
            if (h.result === 'blackjack') {
              bank += h.bet * 2.5
              net += h.bet * 1.5
              w++
              bj++
            } else if (h.result === 'win') {
              bank += h.bet * 2
              net += h.bet
              w++
            } else if (h.result === 'push') {
              bank += h.bet
              p++
            } else {
              net -= h.bet
              l++
            }
          }
          if (s.insBet > 0) {
            if (handValue(s.dealer).total === 21 && s.dealer.length === 2) net += s.insBet * 2
            else net -= s.insBet
          }
          return {
            bank,
            phase: 'over' as Phase,
            summaryNet: net,
            sess: {
              ...s.sess,
              w,
              l,
              p,
              bj,
              hands: s.sess.hands + 1,
              net: s.sess.net + net,
              bankHist: [...s.sess.bankHist, bank],
            },
          }
        })
        // quiz cadence, then summary
        const s = get()
        if (s.settings.countMode === 'quiz') {
          const since = s.sinceQuiz + 1
          set({ sinceQuiz: since })
          if (since >= s.nextQuizAt) {
            set({ quizOpen: true, quiz: { ans: 0, done: false, rc: 0, tc: 0, diff: 0 } })
            return
          }
        }
        setTimeout(() => {
          if (get().phase === 'over') set({ summaryOpen: true })
        }, summaryDelay())
      }

      const settle = () => {
        set((s) => {
          const dt = handValue(s.dealer).total
          const dBust = dt > 21
          const hands = s.hands.map((h) => {
            if (h.result) return h
            const pt = handValue(h.cards).total
            let result: Result
            if (h.busted) result = 'lose'
            else if (dBust || pt > dt) result = 'win'
            else if (pt === dt) result = 'push'
            else result = 'lose'
            return { ...h, result }
          })
          return { hands, phase: 'over' as Phase }
        })
        settleBook()
      }

      const dealerTurn = () => {
        set({ phase: 'dealer' })
        revealHole()
        const alive = get().hands.some((h) => !h.busted)
        const step = () => {
          const st = get()
          if (alive && handValue(st.dealer).total < 17) {
            set({ lock: true })
            setTimeout(() => {
              set((s2) => {
                const c = s2.shoe[s2.shoe.length - 1]
                const shoe = s2.shoe.slice(0, -1)
                return {
                  shoe,
                  dealer: [...s2.dealer, c],
                  rc: countActive() ? s2.rc + hiloValue(c) : s2.rc,
                }
              })
              step()
            }, stepDelay())
          } else {
            set({ lock: false })
            settle()
          }
        }
        setTimeout(step, firstDelay())
      }

      const ensureTwo = (idx: number) =>
        set((s) => {
          const h = s.hands[idx]
          if (h.cards.length !== 1) return {}
          const c = s.shoe[s.shoe.length - 1]
          const shoe = s.shoe.slice(0, -1)
          const hands = s.hands.slice()
          hands[idx] = { ...h, cards: [...h.cards, c], done: h.splitAces ? true : h.done }
          return { shoe, hands, rc: countActive() ? s.rc + hiloValue(c) : s.rc }
        })

      const advance = () => {
        if (get().phase !== 'play') return
        const cur = get().hands[get().active]
        if (cur && !cur.done) return
        const hands = get().hands
        for (let i = 0; i < hands.length; i++) {
          if (!hands[i].done) {
            set({ active: i })
            ensureTwo(i)
            set((s) => {
              const h = s.hands[i]
              if (handValue(h.cards).total === 21) {
                const hs = s.hands.slice()
                hs[i] = { ...h, done: true }
                return { hands: hs }
              }
              return {}
            })
            if (!get().hands[i].done) return
          }
        }
        dealerTurn()
      }

      const afterInsurance = () => {
        const s = get()
        const up = cardValue(s.dealer[0])
        if (up === 11 || up === 10) {
          if (handValue(s.dealer).total === 21) {
            revealHole()
            set((st) => {
              const bank = st.insBet > 0 ? st.bank + st.insBet * 3 : st.bank
              const hands = st.hands.map((h) => ({
                ...h,
                done: true,
                result: (isBlackjack(h.cards, h.fromSplit) ? 'push' : 'lose') as Result,
              }))
              return { bank, hands, phase: 'over' as Phase }
            })
            settleBook()
            return
          }
        }
        // mark any natural blackjacks among the starting boxes
        set((st) => ({
          hands: st.hands.map((h) =>
            isBlackjack(h.cards, h.fromSplit) ? { ...h, done: true, result: 'blackjack' as Result } : h,
          ),
        }))
        // if every box was a blackjack, settle immediately
        if (get().hands.every((h) => h.done)) {
          revealHole()
          settleBook()
          return
        }
        // begin play on the first unfinished box
        set({ active: 0 })
        advance()
      }

      const curHand = () => get().hands[get().active]

      return {
        settings: {
          lang: 'fr',
          coachLive: true,
          countMode: 'off',
          penetration: 0.75,
          decks: 6,
          boxes: 1,
        },
        bank: START_BANK,
        sess: freshSess(),
        countStats: { qN: 0, qExact: 0, qErr: 0 },
        drillStats: { n: 0, ok: 0, best: 0 },

        shoe: newShoe(6),
        rc: 0,
        sinceQuiz: 0,
        nextQuizAt: 3,
        bet: 0,
        lastBet: 10,
        phase: 'bet',
        lock: false,
        dealer: [],
        hole: true,
        hands: [],
        active: 0,
        insBet: 0,
        roundId: 0,
        startingBoxes: 1,
        hintKey: null,
        roundDecs: [],
        toast: null,

        insuranceOpen: false,
        quizOpen: false,
        quiz: { ans: 0, done: false, rc: 0, tc: 0, diff: 0 },
        summaryOpen: false,
        summaryNet: 0,

        drillCur: null,
        drillAnswered: false,
        drillStreak: 0,
        drillFb: null,

        /* ---------------- actions ---------------- */
        boot: () => {
          const s = get()
          // rebuild the shoe to match the (possibly persisted) deck count
          if (s.shoe.length === 0 || s.phase !== 'bet') {
            set({
              shoe: newShoe(s.settings.decks),
              rc: 0,
              phase: 'bet',
              hands: [],
              dealer: [],
              lock: false,
              insuranceOpen: false,
              quizOpen: false,
              summaryOpen: false,
              bet: 0,
            })
          }
        },

        t: (k) => tr(get().settings.lang, k),

        setLang: (lang) => set((s) => ({ settings: { ...s.settings, lang } })),

        setCoach: (coachLive) => {
          set((s) => ({ settings: { ...s.settings, coachLive } }))
          const s = get()
          get().showToast(
            'info',
            tr(s.settings.lang, 'coach') + ' ' + tr(s.settings.lang, coachLive ? 'live' : 'exam'),
            tr(s.settings.lang, coachLive ? 'modeLiveB' : 'modeExamB'),
          )
        },

        setCountMode: (m) => {
          const was = get().settings.countMode
          set((s) => ({ settings: { ...s.settings, countMode: m } }))
          if (m !== 'off' && was === 'off') {
            const s = get()
            set({
              shoe: newShoe(s.settings.decks),
              rc: 0,
              sinceQuiz: 0,
              nextQuizAt: 3 + Math.floor(Math.random() * 3),
            })
            // cancel any in-progress hand: refund bets
            const st = get()
            if (st.phase === 'play' || st.phase === 'dealer') {
              let refund = 0
              for (const h of st.hands) refund += h.bet
              refund += st.insBet
              set((s2) => ({
                bank: s2.bank + refund,
                insBet: 0,
                phase: 'bet',
                hands: [],
                dealer: [],
                bet: Math.min(s2.lastBet, s2.bank + refund),
              }))
            } else if (st.phase === 'over') {
              set((s2) => ({ phase: 'bet', hands: [], dealer: [], bet: Math.min(s2.lastBet, s2.bank) }))
            }
            get().showToast('info', tr(s.settings.lang, 'countT') + ' Hi-Lo', tr(s.settings.lang, 'countOnB'))
          }
        },

        setPenetration: (p) => set((s) => ({ settings: { ...s.settings, penetration: p } })),

        setBoxes: (n) => {
          const boxes = Math.max(1, Math.min(3, Math.round(n)))
          set((s) => ({ settings: { ...s.settings, boxes } }))
          // if idle, nothing else to do; a running hand keeps its layout until next deal
        },

        addChip: (v) =>
          set((s) => {
            const boxes = s.settings.boxes
            if (s.bank - s.bet * boxes >= v * boxes) return { bet: s.bet + v }
            return {}
          }),

        clearBet: () => set({ bet: 0 }),
        setBet: (v) => set({ bet: v }),

        reloadBank: () =>
          set((s) => ({ bank: START_BANK, sess: { ...s.sess, bankHist: [...s.sess.bankHist, START_BANK] } })),

        startRound: () => {
          const s0 = get()
          const boxes = s0.settings.boxes
          const perBox = s0.bet
          const totalWager = perBox * boxes
          if (perBox < 5 || totalWager > s0.bank) return

          let shoe = s0.shoe.slice()
          let rc = s0.rc
          const total = s0.settings.decks * 52
          if (shoe.length <= cutCardRemaining(total, s0.settings.penetration)) {
            shoe = newShoe(s0.settings.decks)
            rc = 0
            get().showToast(
              'info',
              tr(s0.settings.lang, 'shoeShuf'),
              tr(s0.settings.lang, 'shoeShufB') + ' (' + shoe.length + ').',
            )
          }

          const seenDraw = (): Card => {
            const c = shoe[shoe.length - 1]
            shoe = shoe.slice(0, -1)
            if (countActive()) rc += hiloValue(c)
            return c
          }
          const blindDraw = (): Card => {
            const c = shoe[shoe.length - 1]
            shoe = shoe.slice(0, -1)
            return c
          }

          // real-table dealing: first card to each box, dealer up, second to each box, dealer hole
          const first: Card[] = []
          for (let b = 0; b < boxes; b++) first.push(seenDraw())
          const dUp = seenDraw()
          const second: Card[] = []
          for (let b = 0; b < boxes; b++) second.push(seenDraw())
          const dHole = blindDraw()

          const hands: Hand[] = []
          for (let b = 0; b < boxes; b++) {
            hands.push({
              cards: [first[b], second[b]],
              bet: perBox,
              done: false,
              doubled: false,
              fromSplit: false,
              splitAces: false,
              busted: false,
              result: null,
              box: b,
            })
          }

          set({
            shoe,
            rc,
            bank: s0.bank - totalWager,
            lastBet: perBox,
            insBet: 0,
            roundDecs: [],
            hole: true,
            hintKey: null,
            dealer: [dUp, dHole],
            hands,
            active: 0,
            roundId: s0.roundId + 1,
            startingBoxes: boxes,
            phase: 'play',
            summaryOpen: false,
          })

          if (cardValue(dUp) === 11 && s0.bank - totalWager >= totalWager / 2) {
            set({ insuranceOpen: true })
            return
          }
          afterInsurance()
        },

        answerInsurance: (take) => {
          set({ insuranceOpen: false })
          recordInsurance(take)
          if (take) {
            set((s) => {
              const cost = (s.bet * s.startingBoxes) / 2
              return { insBet: cost, bank: s.bank - cost }
            })
          }
          afterInsurance()
        },

        doAction: (a) => {
          const s = get()
          if (s.phase !== 'play' || s.lock) return
          const h = curHand()
          if (!h) return
          if (a === 'D' && !(h.cards.length === 2 && !h.splitAces && s.bank >= h.bet)) return
          if (
            a === 'P' &&
            !(
              h.cards.length === 2 &&
              cardValue(h.cards[0]) === cardValue(h.cards[1]) &&
              s.hands.length < s.startingBoxes + 3 &&
              !h.splitAces &&
              s.bank >= h.bet
            )
          )
            return

          recordDecision(a, h)
          const idx = s.active

          if (a === 'H') {
            set((st) => {
              const c = st.shoe[st.shoe.length - 1]
              const shoe = st.shoe.slice(0, -1)
              const hands = st.hands.slice()
              const nh = { ...hands[idx], cards: [...hands[idx].cards, c] }
              const tt = handValue(nh.cards).total
              if (tt > 21) {
                nh.busted = true
                nh.done = true
                nh.result = 'lose'
              } else if (tt === 21) nh.done = true
              hands[idx] = nh
              return { shoe, hands, rc: countActive() ? st.rc + hiloValue(c) : st.rc }
            })
          } else if (a === 'S') {
            set((st) => {
              const hands = st.hands.slice()
              hands[idx] = { ...hands[idx], done: true }
              return { hands }
            })
          } else if (a === 'D') {
            set((st) => {
              const c = st.shoe[st.shoe.length - 1]
              const shoe = st.shoe.slice(0, -1)
              const hands = st.hands.slice()
              const nh = { ...hands[idx], bet: hands[idx].bet * 2, doubled: true, cards: [...hands[idx].cards, c] }
              if (handValue(nh.cards).total > 21) {
                nh.busted = true
                nh.result = 'lose'
              }
              nh.done = true
              hands[idx] = nh
              return { shoe, hands, bank: st.bank - hands[idx].bet / 2, rc: countActive() ? st.rc + hiloValue(c) : st.rc }
            })
          } else if (a === 'P') {
            set((st) => {
              const h0 = st.hands[idx]
              const c1 = h0.cards[0]
              const c2 = h0.cards[1]
              const ace = c1.r === 'A'
              const mk = (c: Card): Hand => ({
                cards: [c],
                bet: h0.bet,
                done: false,
                doubled: false,
                fromSplit: true,
                splitAces: ace,
                busted: false,
                result: null,
                box: h0.box,
              })
              const hands = st.hands.slice()
              hands.splice(idx, 1, mk(c1), mk(c2))
              return { hands, bank: st.bank - h0.bet }
            })
            ensureTwo(idx)
            set((st) => {
              const h = st.hands[idx]
              if (handValue(h.cards).total === 21) {
                const hands = st.hands.slice()
                hands[idx] = { ...h, done: true }
                return { hands }
              }
              return {}
            })
          }
          advance()
        },

        hint: () => {
          const s = get()
          if (s.phase !== 'play') return
          const h = curHand()
          if (!h) return
          const dv = cardValue(s.dealer[0])
          const canD = h.cards.length === 2 && !h.splitAces && s.bank >= h.bet
          const canP =
            h.cards.length === 2 &&
            cardValue(h.cards[0]) === cardValue(h.cards[1]) &&
            s.hands.length < s.startingBoxes + 3 &&
            !h.splitAces &&
            s.bank >= h.bet
          const rec = strategy(h.cards, dv, canD, canP)
          set({ hintKey: s.active + ':' + h.cards.length })
          get().showToast(
            'info',
            tr(s.settings.lang, 'hintT') + actName(rec, s.settings.lang),
            explain(h.cards, dv, rec, s.settings.lang) + tr(s.settings.lang, 'hintNote'),
          )
        },

        rebet: () => {
          const s = get()
          const boxes = s.settings.boxes
          let bet = Math.min(s.lastBet, Math.floor(s.bank / boxes))
          if (bet < 5) bet = 0
          set({ phase: 'bet', hands: [], dealer: [], bet, summaryOpen: false, roundDecs: [] })
          if (bet >= 5) get().startRound()
        },

        resetSession: () => {
          const s = get()
          set({
            sess: freshSess(),
            countStats: { qN: 0, qExact: 0, qErr: 0 },
            drillStats: { n: 0, ok: 0, best: 0 },
            bank: START_BANK,
            bet: 0,
            phase: 'bet',
            hands: [],
            dealer: [],
            shoe: newShoe(s.settings.decks),
            rc: 0,
            sinceQuiz: 0,
            drillCur: null,
            drillAnswered: false,
            drillStreak: 0,
            drillFb: null,
            summaryOpen: false,
          })
          get().showToast('info', tr(s.settings.lang, 'sessReset'), tr(s.settings.lang, 'sessResetB'))
        },

        showToast: (kind, title, body) => set({ toast: { id: ++toastSeq, kind, title, body } }),
        hideToast: () => set({ toast: null }),

        openSummary: () => set({ summaryOpen: true }),
        closeSummary: () => set({ summaryOpen: false }),

        quizStep: (d) =>
          set((s) => (s.quiz.done ? {} : { quiz: { ...s.quiz, ans: s.quiz.ans + d } })),

        quizSubmit: () => {
          const s = get()
          if (!s.quiz.done) {
            const rc = s.rc
            const diff = Math.abs(s.quiz.ans - rc)
            const tc = trueCount(rc, s.shoe.length)
            set((st) => ({
              quiz: { ...st.quiz, done: true, rc, tc, diff },
              countStats: {
                qN: st.countStats.qN + 1,
                qExact: st.countStats.qExact + (diff === 0 ? 1 : 0),
                qErr: st.countStats.qErr + diff,
              },
            }))
          } else {
            set({
              quizOpen: false,
              sinceQuiz: 0,
              nextQuizAt: 3 + Math.floor(Math.random() * 3),
            })
            setTimeout(() => {
              if (get().phase === 'over') set({ summaryOpen: true })
            }, 150)
          }
        },

        nextDrill: () => {
          const s = get()
          const mistList: Situation[] = Object.values(s.sess.mist)
            .filter((m) => m.cat !== 'ins' && m.row != null && m.col != null)
            .map((m) => ({ cat: m.cat as Category, row: m.row as number, col: m.col as number }))
          set({ drillCur: drillSitu(mistList), drillAnswered: false, drillFb: null })
        },

        drillAnswer: (a) => {
          const s = get()
          if (s.drillAnswered || !s.drillCur) return
          const { cards, dv } = s.drillCur
          const isPair = cardValue(cards[0]) === cardValue(cards[1])
          const rec = strategy(cards, dv, true, isPair)
          const ok = a === rec
          const streak = ok ? s.drillStreak + 1 : 0
          set((st) => ({
            drillAnswered: true,
            drillStreak: streak,
            drillStats: {
              n: st.drillStats.n + 1,
              ok: st.drillStats.ok + (ok ? 1 : 0),
              best: Math.max(st.drillStats.best, streak),
            },
          }))
          tallyCat('drill', ok)
          if (!ok) addMistake(situ(cards, dv), rec)
          const ex = explain(cards, dv, rec, s.settings.lang)
          set({
            drillFb: {
              ok,
              actLabel: ok
                ? tr(s.settings.lang, 'goodCall') + actName(a, s.settings.lang)
                : tr(s.settings.lang, 'mistakeT') + actName(rec, s.settings.lang),
              ex,
            },
          })
          if (ok)
            setTimeout(() => {
              if (get().drillAnswered) get().nextDrill()
            }, reduced() ? 300 : 900)
        },
      }
    },
    {
      name: 'bj-coach-pro',
      version: 1,
      partialize: (s) => ({
        settings: s.settings,
        bank: s.bank,
        sess: s.sess,
        countStats: s.countStats,
        drillStats: s.drillStats,
      }),
    },
  ),
)

/* Convenience selectors */
export const useLang = () => useGame((s) => s.settings.lang)
