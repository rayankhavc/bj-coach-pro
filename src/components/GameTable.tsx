import { useGame } from '@/store/useGame'
import { useShallow } from 'zustand/react/shallow'
import { cardValue, handValue } from '@/lib/engine'
import { totalStr } from '@/lib/display'
import { fmt } from '@/lib/i18n'
import Card from './Card'

const resClass = (r: string | null) => (r === 'lose' ? 'lose' : r === 'push' ? 'push' : 'win')

/** The dealer + player felt area (read-only view of the shared game state). */
export default function GameTable() {
  const { dealer, hole, hands, active, phase, roundId, settings, t } = useGame(
    useShallow((s) => ({
      dealer: s.dealer,
      hole: s.hole,
      hands: s.hands,
      active: s.active,
      phase: s.phase,
      roundId: s.roundId,
      settings: s.settings,
      t: s.t,
    })),
  )
  const lang = settings.lang
  const RES: Record<string, string> = {
    win: t('won'),
    lose: t('lost'),
    push: t('push'),
    blackjack: t('bjWin'),
  }

  return (
    <>
      <section className="dealer-area">
        <div className="zone-label">{t('dealer')}</div>
        <div className="cards">
          {dealer.map((c, i) => (
            <Card key={`${roundId}-d-${i}`} card={c} hidden={i === 1 && hole} index={i} />
          ))}
        </div>
        <div>
          {dealer.length > 0 && (
            <span className="total-badge">
              {hole ? `${cardValue(dealer[0])} + ?` : totalStr(dealer)}
            </span>
          )}
        </div>
      </section>

      <div className="divider">
        <span>{t('divider')}</span>
      </div>

      <section className="player-area">
        <div className="zone-label">{t('you')}</div>
        {hands.length === 0 ? (
          <div style={{ color: 'var(--cream-dim)', fontSize: '.8rem', padding: '24px 0' }}>
            {t('placeBet')}
          </div>
        ) : (
          <div className="boxes-row">
            {hands.map((h, i) => {
              const act = phase === 'play' && i === active && !h.done
              const busted = h.busted || handValue(h.cards).total > 21
              return (
                <div className={'hand' + (act ? ' active' : '')} key={`${roundId}-h-${i}`}>
                  <div className="cards">
                    {h.cards.map((c, j) => (
                      <Card key={`${roundId}-h-${i}-${j}`} card={c} index={j} />
                    ))}
                  </div>
                  <span className="total-badge">
                    {totalStr(h.cards)}
                    {busted ? t('bust') : ''}
                  </span>
                  <div className="meta mono">
                    {t('betLbl')} {fmt(h.bet, lang)}
                    {hands.length > 1 ? ` · ${t('handN')} ${i + 1}` : ''}
                  </div>
                  {h.result && <div className={`res ${resClass(h.result)}`}>{RES[h.result]}</div>}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="kb-hint">{t('kbHint')}</div>
    </>
  )
}
