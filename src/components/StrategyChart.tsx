import { useMemo, useState } from 'react'
import { useGame } from '@/store/useGame'
import { useShallow } from 'zustand/react/shallow'
import { useT } from '@/hooks/useT'
import {
  COLS,
  chartCellCode,
  situ,
  cardValue,
  type Category,
  type Action,
  type Code,
} from '@/lib/engine'

type Tab = 'hard' | 'soft' | 'pair'
interface Target {
  cat: Category
  row: number
  col: number
}

const HARD_ROWS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
const SOFT_ROWS = [13, 14, 15, 16, 17, 18, 19, 20]
const PAIR_VALS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const rowsFor = (cat: Tab) => (cat === 'hard' ? HARD_ROWS : cat === 'soft' ? SOFT_ROWS : PAIR_VALS)

const rowLabel = (cat: Tab, row: number) =>
  cat === 'hard' ? (row === 17 ? '17+' : String(row)) : cat === 'soft' ? `A,${row - 11}` : row === 11 ? 'A,A' : `${row},${row}`

const codeDisplay = (code: Code) => (code === 'T' ? 'Ds' : code)

/** Full-page basic-strategy chart, with a live highlight and an optional "guess the cell" quiz. */
export default function StrategyChart() {
  const { dealer, hands, active, phase } = useGame(
    useShallow((s) => ({
      dealer: s.dealer,
      hands: s.hands,
      active: s.active,
      phase: s.phase,
    })),
  )
  const t = useT()

  const [tab, setTab] = useState<Tab>('hard')
  const [quiz, setQuiz] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [answered, setAnswered] = useState<{ ok: boolean } | null>(null)
  const [score, setScore] = useState({ n: 0, ok: 0 })

  // live highlight from an in-progress hand
  const liveHL = useMemo(() => {
    if (quiz || phase !== 'play' || !dealer.length) return null
    const h = hands[active]
    if (!h) return null
    return situ(h.cards, cardValue(dealer[0]))
  }, [quiz, phase, dealer, hands, active])

  const pickTarget = (cat: Tab): Target => {
    const rows = rowsFor(cat)
    const row = rows[Math.floor(Math.random() * rows.length)]
    const col = Math.floor(Math.random() * COLS.length)
    return { cat, row, col }
  }

  const startQuiz = () => {
    setQuiz(true)
    setAnswered(null)
    setScore({ n: 0, ok: 0 })
    setTarget(pickTarget(tab))
  }
  const stopQuiz = () => {
    setQuiz(false)
    setTarget(null)
    setAnswered(null)
  }
  const nextTarget = () => {
    setAnswered(null)
    setTarget(pickTarget(tab))
  }
  const switchTab = (nt: Tab) => {
    setTab(nt)
    if (quiz) {
      setAnswered(null)
      setTarget(pickTarget(nt))
    }
  }

  const answerQuiz = (a: Action) => {
    if (!target || answered) return
    const correct = chartCellCode(target.cat, target.row, target.col)
    // chart target is never a "Ds" downgrade in play terms; resolve T→D for the guess
    const want: Action = correct === 'T' ? 'D' : (correct as Action)
    const ok = a === want
    setAnswered({ ok })
    setScore((sc) => ({ n: sc.n + 1, ok: sc.ok + (ok ? 1 : 0) }))
  }

  const legend = (
    <div className="legend">
      <span>
        <i style={{ background: '#a3453b' }} />
        {t('lgHit')}
      </span>
      <span>
        <i style={{ background: '#2f7d4f' }} />
        {t('lgStand')}
      </span>
      <span>
        <i style={{ background: '#3e6fa3' }} />
        {t('lgDh')}
      </span>
      <span>
        <i style={{ background: '#3e8fa3' }} />
        {t('lgDs')}
      </span>
      <span>
        <i style={{ background: '#7d5cae' }} />
        {t('lgSplit')}
      </span>
    </div>
  )

  const renderCell = (cat: Tab, row: number, col: number) => {
    const code = chartCellCode(cat, row, col)
    const isTarget = quiz && target && target.cat === cat && target.row === row && target.col === col
    const isLive = liveHL && liveHL.cat === cat && liveHL.row === row && liveHL.col === col

    if (quiz) {
      if (isTarget && answered) {
        return (
          <td key={col} className={`${code} ${answered.ok ? 'quiz-ok' : 'quiz-ko'}`}>
            {codeDisplay(code)}
          </td>
        )
      }
      if (isTarget) {
        return (
          <td key={col} className="quiz-hidden hl">
            ?
          </td>
        )
      }
      return (
        <td key={col} className="quiz-hidden">
          &nbsp;
        </td>
      )
    }

    return (
      <td key={col} className={code + (isLive ? ' hl' : '')}>
        {codeDisplay(code)}
      </td>
    )
  }

  const rows = rowsFor(tab)

  return (
    <div>
      <div className="tabs">
        {(['hard', 'soft', 'pair'] as Tab[]).map((tt) => (
          <button key={tt} type="button" className={'tab' + (tab === tt ? ' on' : '')} onClick={() => switchTab(tt)}>
            {tt === 'hard' ? t('tabHard') : tt === 'soft' ? t('tabSoft') : t('tabPair')}
          </button>
        ))}
      </div>

      <div className="chart-scroll">
        <table className="strat">
          <thead>
            <tr>
              <th></th>
              {COLS.map((v) => (
                <th key={v}>{v === 11 ? 'A' : v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th>{rowLabel(tab, row)}</th>
                {COLS.map((_, col) => renderCell(tab, row, col))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {legend}

      <div className="btn-row">
        {!quiz ? (
          <button type="button" className="abtn a-deal" onClick={startQuiz}>
            {t('chartQuiz')}
          </button>
        ) : (
          <button type="button" className="abtn a-ghost" onClick={stopQuiz}>
            {t('chartShow')}
          </button>
        )}
      </div>

      {quiz && (
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <p className="drill-sub">{t('chartQuizHint')}</p>
          <div className="drill-score" style={{ marginBottom: 10 }}>
            <div>
              <span>{t('chartScore')}</span>
              <b>
                {score.ok}/{score.n}
              </b>
            </div>
          </div>
          <div className="drill-btns">
            <button type="button" className="abtn a-hit" onClick={() => answerQuiz('H')} disabled={!!answered}>
              {t('hit')}
            </button>
            <button type="button" className="abtn a-stand" onClick={() => answerQuiz('S')} disabled={!!answered}>
              {t('stand')}
            </button>
            <button type="button" className="abtn a-dbl" onClick={() => answerQuiz('D')} disabled={!!answered}>
              {t('dbl')}
            </button>
            <button type="button" className="abtn a-spl" onClick={() => answerQuiz('P')} disabled={!!answered}>
              {t('split')}
            </button>
          </div>
          {answered && (
            <div className="act-row" style={{ marginTop: 12 }}>
              <button type="button" className="abtn a-deal" onClick={nextTarget}>
                {t('next')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
