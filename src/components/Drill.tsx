import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/store/useGame'
import { cardValue, type Action, type Rank } from '@/lib/engine'
import Card from './Card'

/** Full-page adaptive flash-drill. Shares mistakes/stats with the rest of the app. */
export default function Drill() {
  const s = useGame()
  const { drillCur, drillAnswered, drillStreak, drillStats, drillFb, t } = s

  // seed the first situation on mount
  useEffect(() => {
    if (!s.drillCur) s.nextDrill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (document.querySelector('.overlay')) return
      if (e.key === '1') s.drillAnswer('H')
      else if (e.key === '2') s.drillAnswer('S')
      else if (e.key === '3') s.drillAnswer('D')
      else if (e.key === '4') s.drillAnswer('P')
      else if (e.key === 'Enter') s.nextDrill()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dv = drillCur?.dv ?? 0
  const upRank: Rank = dv === 11 ? 'A' : dv === 10 ? '10' : (String(dv) as Rank)
  const cards = drillCur?.cards ?? []
  const isPair = cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1])

  const answer = (a: Action) => s.drillAnswer(a)

  return (
    <div className="drill">
      <div className="drill-score">
        <div>
          <span>{t('score')}</span>
          <b>
            {drillStats.ok}/{drillStats.n}
          </b>
        </div>
        <div>
          <span>{t('streak')}</span>
          <b>{drillStreak}</b>
        </div>
        <div>
          <span>{t('best')}</span>
          <b>{drillStats.best}</b>
        </div>
      </div>

      <p className="drill-sub">{t('drillSub')}</p>

      <div className="drill-vs">{t('dealer')}</div>
      <div className="cards">
        {drillCur && <Card card={{ r: upRank, s: '♠' }} index={0} />}
        {drillCur && <Card hidden index={1} />}
      </div>

      <div className="drill-vs">{t('you')}</div>
      <div className="cards">
        {cards.map((c, i) => (
          <Card key={`${dv}-${i}-${c.r}${c.s}`} card={c} index={i} />
        ))}
      </div>

      <div className="drill-q">{t('yourMove')}</div>
      <div className="drill-btns">
        <button type="button" className="abtn a-hit" onClick={() => answer('H')} disabled={drillAnswered}>
          {t('hit')}
        </button>
        <button type="button" className="abtn a-stand" onClick={() => answer('S')} disabled={drillAnswered}>
          {t('stand')}
        </button>
        <button type="button" className="abtn a-dbl" onClick={() => answer('D')} disabled={drillAnswered}>
          {t('dbl')}
        </button>
        <button
          type="button"
          className="abtn a-spl"
          onClick={() => answer('P')}
          disabled={drillAnswered || !isPair}
        >
          {t('split')}
        </button>
      </div>

      {drillFb && (
        <motion.div
          className={'drill-fb ' + (drillFb.ok ? 'good' : 'bad')}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="v">{drillFb.actLabel}</div>
          <p>{drillFb.ex}</p>
          {!drillFb.ok && (
            <div className="btn-row">
              <button type="button" className="abtn a-ghost" onClick={s.nextDrill}>
                {t('gotIt')}
              </button>
            </div>
          )}
        </motion.div>
      )}

      <div className="act-row" style={{ marginTop: 16 }}>
        <button type="button" className="abtn a-deal" onClick={s.nextDrill}>
          {t('next')}
        </button>
      </div>
    </div>
  )
}
