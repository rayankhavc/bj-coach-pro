import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/store/useGame'
import { handValue, situ, type Action } from '@/lib/engine'
import { actName, explain, fmt, insExpl, situLabel } from '@/lib/i18n'

interface Props {
  onOpenStats: () => void
}

/** Per-hand recap sheet shown after each round (results + decision-by-decision coaching). */
export default function HandSummary({ onOpenStats }: Props) {
  const s = useGame()
  const { summaryOpen, summaryNet, hands, roundDecs, settings, t } = s
  const lang = settings.lang

  const RES: Record<string, string> = {
    win: t('won'),
    lose: t('lost'),
    push: t('push'),
    blackjack: t('bjWin'),
  }

  return (
    <AnimatePresence>
      {summaryOpen && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) s.closeSummary()
          }}
        >
          <motion.div
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <button type="button" className="close-x" onClick={s.closeSummary}>
              ×
            </button>
            <h2>{t('sumTitle')}</h2>
            <div className={'net ' + (summaryNet > 0 ? 'pos' : summaryNet < 0 ? 'neg' : '')}>
              {(summaryNet > 0 ? '+' : '') + fmt(summaryNet, lang)}
            </div>

            <div>
              {hands.map((h, i) => {
                const v = handValue(h.cards)
                const mk = h.result === 'lose' ? 'ko' : h.result === 'push' ? 'hint' : 'ok'
                const sym = h.result === 'lose' ? '−' : h.result === 'push' ? '=' : '+'
                return (
                  <div className="dec-line" key={i}>
                    <span className={`mk ${mk}`}>{sym}</span>
                    <div>
                      <b>
                        {t('handN')} {i + 1}
                      </b>{' '}
                      · {h.cards.map((c) => c.r + c.s).join(' ')} ({v.total}
                      {h.busted ? t('bust') : ''}) — {RES[h.result ?? 'push']}
                    </div>
                  </div>
                )
              })}
            </div>

            <h3>{t('sumDec')}</h3>
            <div>
              {roundDecs.length ? (
                roundDecs.map((d, i) => {
                  const label = d.ins
                    ? t('insSitu')
                    : situLabel(situ(d.cards!, d.dv!), lang)
                  const ex = d.ins ? insExpl(lang) : explain(d.cards!, d.dv!, d.rec as Action, lang)
                  const mk = d.hinted ? (
                    <span className="mk hint">💡</span>
                  ) : d.ok ? (
                    <span className="mk ok">✓</span>
                  ) : (
                    <span className="mk ko">✗</span>
                  )
                  return (
                    <div className="dec-line" key={i}>
                      {mk}
                      <div>
                        <b>{label}</b> → {actName(d.act as Action, lang)}
                        {!d.ok && (
                          <div className="fix">
                            {t('hadTo')}
                            {actName(d.rec as Action, lang)}
                          </div>
                        )}
                        <div className="why">{ex}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="why" style={{ fontSize: '.78rem', color: 'var(--cream-dim)' }}>
                  {t('sumNone')}
                </div>
              )}
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="abtn a-deal"
                onClick={() => {
                  s.closeSummary()
                  s.rebet()
                }}
              >
                {t('replay')}
              </button>
              <button
                type="button"
                className="abtn a-ghost"
                onClick={() => {
                  s.closeSummary()
                  onOpenStats()
                }}
              >
                {t('coaching')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
