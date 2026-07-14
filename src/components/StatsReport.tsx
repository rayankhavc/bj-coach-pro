import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame, type Sess, type Mistake } from '@/store/useGame'
import { actName, fmt, situLabel, tr, type Lang } from '@/lib/i18n'
import type { Action, Category, Situation } from '@/lib/engine'

interface Props {
  open: boolean
  onClose: () => void
}

const asSitu = (m: Mistake): Situation => ({
  cat: m.cat as Category,
  row: m.row ?? 0,
  col: m.col ?? 0,
})

function buildAdvice(lang: Lang, acc: number | null, s: Sess, ms: Mistake[]): string {
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  let x = ''
  if (s.dec < 20)
    x = L(
      `Trop peu de décisions (${s.dec}) pour juger. Enchaîne au moins 50–100 mains avant de tirer des conclusions.`,
      `Too few decisions (${s.dec}) to judge. Play at least 50–100 hands before drawing conclusions.`,
    )
  else if (acc === 100)
    x = L(
      `100 % sur ${s.dec} décisions. Passe en mode Examen si ce n'est pas déjà fait, et tiens ce niveau sur 200+ mains.`,
      `100% over ${s.dec} decisions. Switch to Exam mode if you haven't, and hold that level over 200+ hands.`,
    )
  else if (acc !== null && acc >= 95)
    x = L(
      `Solide (${acc} %). En vrai, chaque erreur restante te coûte de l'espérance. Bosse les situations listées ci-dessus jusqu'à 100 %.`,
      `Solid (${acc}%). In real play, every remaining mistake costs you expected value. Grind the situations above until 100%.`,
    )
  else if (acc !== null && acc >= 85)
    x = L(
      `Correct mais insuffisant pour une vraie table : à ${acc} %, tu ajoutes ~1 % ou plus à l'avantage du casino. Révise le tableau, surtout tes erreurs récurrentes.`,
      `Decent but not enough for a real table: at ${acc}%, you're handing the house an extra ~1% or more. Review the chart, especially your recurring mistakes.`,
    )
  else
    x = L(
      `À ${acc} %, tu donnerais beaucoup trop au casino. Ouvre le tableau, joue en mode LIVE avec l'indice 💡, et passe au Drill éclair sur tes zones faibles.`,
      `At ${acc}%, you'd be giving the house far too much. Open the chart, play in LIVE mode with the 💡 hint, and hit the Flash drill on your weak spots.`,
    )
  if (ms.length) {
    const label = ms[0].cat === 'ins' ? tr(lang, 'insSitu') : situLabel(asSitu(ms[0]), lang)
    x +=
      '<br><br>' +
      L('Priorité n°1 : ', 'Priority #1: ') +
      '<b>' +
      label +
      '</b> — ' +
      tr(lang, 'playV') +
      ' ' +
      actName(ms[0].rec as Action, lang) +
      ' (' +
      ms[0].n +
      '×).'
  }
  x +=
    "<br><br><span style='color:var(--cream-dim)'>" +
    L(
      `Rappel : la stratégie de base parfaite laisse ~0,5 % d'avantage au casino. Elle sert à perdre le moins possible, pas à gagner. Session sauvegardée dans ton navigateur.`,
      `Reminder: perfect basic strategy still leaves the house ~0.5%. It's about losing the least, not winning. Session saved in your browser.`,
    ) +
    '</span>'
  return x
}

export default function StatsReport({ open, onClose }: Props) {
  const s = useGame()
  const { sess, countStats, bank, settings, t } = s
  const lang = settings.lang
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const acc = sess.dec ? Math.round((100 * sess.ok) / sess.dec) : null
  const ms = Object.values(sess.mist).sort((a, b) => b.n - a.n)

  useEffect(() => {
    if (!open) return
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const w = cv.width
    const h = cv.height
    const d = sess.bankHist
    ctx.clearRect(0, 0, w, h)
    const mn = Math.min(...d)
    const mx = Math.max(...d)
    const rg = mx - mn || 1
    if (1000 >= mn && 1000 <= mx) {
      ctx.strokeStyle = 'rgba(201,162,75,.35)'
      ctx.beginPath()
      const y0 = h - 6 - ((1000 - mn) / rg) * (h - 14)
      ctx.moveTo(0, y0)
      ctx.lineTo(w, y0)
      ctx.stroke()
    }
    ctx.strokeStyle = '#54b178'
    ctx.lineWidth = 2
    ctx.beginPath()
    d.forEach((v, i) => {
      const x = d.length > 1 ? (i / (d.length - 1)) * w : 0
      const y = h - 6 - ((v - mn) / rg) * (h - 14)
      if (i) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
    })
    ctx.stroke()
  }, [open, sess.bankHist])

  const stCell = (label: string, value: string) => (
    <div className="stat" key={label}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )

  const cats: [keyof Sess['cat'], string][] = [
    ['hard', t('catHard')],
    ['soft', t('catSoft')],
    ['pair', t('catPair')],
    ['ins', t('catIns')],
    ['drill', t('catDrill')],
  ]

  const copyReport = () => {
    const acc2 = sess.dec ? Math.round((100 * sess.ok) / sess.dec) : 0
    const msTxt = ms
      .slice(0, 5)
      .map(
        (m) =>
          '- ' +
          (m.cat === 'ins' ? tr(lang, 'insSitu') : situLabel(asSitu(m), lang)) +
          ' → ' +
          actName(m.rec as Action, lang) +
          ' (×' +
          m.n +
          ')',
      )
      .join('\n')
    const txt =
      'BJ COACH PRO — ' +
      new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') +
      '\n' +
      t('accuracy') +
      ': ' +
      acc2 +
      '% (' +
      sess.dec +
      ' ' +
      t('decisions').toLowerCase() +
      ')' +
      '\n' +
      t('handsWLP') +
      ': ' +
      sess.w +
      '/' +
      sess.l +
      '/' +
      sess.p +
      ' · ' +
      t('net') +
      ': ' +
      (sess.net > 0 ? '+' : '') +
      fmt(sess.net, lang) +
      (msTxt ? '\n' + t('mistT') + ':\n' + msTxt : '')
    try {
      navigator.clipboard
        .writeText(txt)
        .then(() => s.showToast('info', t('copied'), ''))
        .catch(() => s.showToast('info', '—', txt))
    } catch {
      s.showToast('info', '—', txt)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <button type="button" className="close-x" onClick={onClose}>
              ×
            </button>
            <h2>{t('statsTitle')}</h2>

            <div className="statgrid">
              {stCell(t('accuracy'), acc === null ? '—' : acc + ' %')}
              {stCell(t('decisions'), sess.dec + (sess.hints ? ' (+' + sess.hints + ' 💡)' : ''))}
              {stCell(t('handsWLP'), `${sess.w} / ${sess.l} / ${sess.p}`)}
              {stCell(t('net'), (sess.net > 0 ? '+' : '') + fmt(sess.net, lang))}
              {stCell(t('bestStreak'), String(sess.bestStreak))}
              {stCell(t('bank'), fmt(bank, lang))}
              {countStats.qN > 0 &&
                stCell(
                  t('countQuizL'),
                  countStats.qExact + '/' + countStats.qN + ' · Δ' + (countStats.qErr / countStats.qN).toFixed(1),
                )}
              {stCell(t('bjs'), String(sess.bj))}
            </div>

            <h3>{t('byCat')}</h3>
            <div>
              {cats.some(([k]) => sess.cat[k].n > 0) ? (
                cats.map(([k, nm]) => {
                  const c = sess.cat[k]
                  if (!c.n) return null
                  const pc = Math.round((100 * c.ok) / c.n)
                  return (
                    <div className="catbar" key={k}>
                      <span className="nm">{nm}</span>
                      <span className="bar">
                        <i style={{ width: pc + '%' }} />
                      </span>
                      <span className="pc">
                        {pc}% <span style={{ color: 'var(--cream-dim)' }}>({c.n})</span>
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="why" style={{ fontSize: '.74rem', color: 'var(--cream-dim)' }}>
                  —
                </div>
              )}
            </div>

            <h3>{t('sparkT')}</h3>
            <canvas ref={canvasRef} className="spark" width={440} height={64} />

            <h3>{t('mistT')}</h3>
            <div>
              {ms.length ? (
                ms.slice(0, 8).map((m, i) => {
                  const label = m.cat === 'ins' ? t('insSitu') : situLabel(asSitu(m), lang)
                  return (
                    <div className="mistake" key={i}>
                      <span className="cnt">×{m.n}</span>
                      <b>{label}</b> → {t('playV')} <b>{actName(m.rec as Action, lang)}</b>
                    </div>
                  )
                })
              ) : (
                <div className="why" style={{ fontSize: '.78rem', color: 'var(--cream-dim)' }}>
                  {t('noMist')}
                </div>
              )}
            </div>

            <div
              className="advice"
              dangerouslySetInnerHTML={{ __html: buildAdvice(lang, acc, sess, ms) }}
            />

            <div className="btn-row">
              <button type="button" className="abtn a-ghost" onClick={copyReport}>
                {t('copyBtn')}
              </button>
              <button
                type="button"
                className="abtn a-ghost"
                onClick={() => {
                  s.resetSession()
                  onClose()
                }}
              >
                {t('resetBtn')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
