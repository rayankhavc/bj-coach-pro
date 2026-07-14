import { useGame } from '@/store/useGame'
import { trueCount, cardValue } from '@/lib/engine'
import { fmt } from '@/lib/i18n'
import Chip from './Chip'

const CHIPS = [5, 10, 25, 50, 100] as const

/** The fixed bottom control dock: betting in the bet phase, actions in play, recap when over. */
export default function Dock() {
  const s = useGame()
  const { phase, bet, bank, settings, rc, shoe, hands, active, startingBoxes, t } = s
  const lang = settings.lang
  const boxes = settings.boxes

  if (phase === 'bet') {
    const totalWager = bet * boxes
    let countLine: string | null = null
    if (settings.countMode === 'visible') {
      const tc = trueCount(rc, shoe.length)
      const units = Math.max(1, Math.min(8, Math.round(tc) - 1))
      countLine =
        'TC ' +
        (tc > 0 ? '+' : '') +
        tc.toFixed(1) +
        ' → ' +
        (tc < 2 ? `${t('minBet')} (5 €)` : `${t('sugBet')} ${fmt(units * 5, lang)}`)
    }
    return (
      <div className="dock">
        {countLine && <div className="count-line">{countLine}</div>}
        <div className="dock-info">
          <span>
            {t('bet')} : <b>{fmt(bet, lang)}</b>
            {boxes > 1 && (
              <span style={{ color: 'var(--cream-dim)' }}>
                {' '}
                × {boxes} = {fmt(totalWager, lang)}
              </span>
            )}
          </span>
          <button type="button" className="pill" onClick={s.clearBet}>
            {t('clear')}
          </button>
        </div>
        <div className="bet-row">
          {CHIPS.map((v) => (
            <Chip key={v} value={v} disabled={bank - totalWager < v * boxes} onAdd={s.addChip} />
          ))}
        </div>
        <div className="act-row">
          <button
            type="button"
            className="abtn a-deal"
            disabled={bet < 5 || totalWager > bank}
            onClick={s.startRound}
          >
            {t('deal')}
          </button>
          {bank < 5 && (
            <button type="button" className="abtn a-ghost" onClick={s.reloadBank}>
              {t('reload')}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'play') {
    const h = hands[active]
    const canD = !!h && h.cards.length === 2 && !h.splitAces && bank >= h.bet
    const canP =
      !!h &&
      h.cards.length === 2 &&
      cardValue(h.cards[0]) === cardValue(h.cards[1]) &&
      hands.length < startingBoxes + 3 &&
      !h.splitAces &&
      bank >= h.bet
    return (
      <div className="dock">
        <div className="act-row" style={{ marginBottom: 8 }}>
          <button type="button" className="abtn a-hit" onClick={() => s.doAction('H')}>
            {t('hit')}
          </button>
          <button type="button" className="abtn a-stand" onClick={() => s.doAction('S')}>
            {t('stand')}
          </button>
        </div>
        <div className="act-row">
          <button type="button" className="abtn a-dbl" disabled={!canD} onClick={() => s.doAction('D')}>
            {t('dbl')}
          </button>
          <button type="button" className="abtn a-spl" disabled={!canP} onClick={() => s.doAction('P')}>
            {t('split')}
          </button>
          <button type="button" className="abtn hint-btn" onClick={s.hint} aria-label="hint">
            💡
          </button>
        </div>
      </div>
    )
  }

  // over
  return (
    <div className="dock">
      <div className="act-row">
        <button type="button" className="abtn a-deal" onClick={s.rebet}>
          {t('newHand')}
        </button>
        <button type="button" className="abtn a-ghost" onClick={s.openSummary}>
          {t('recap')}
        </button>
      </div>
    </div>
  )
}
