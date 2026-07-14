import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/store/useGame'

interface Props {
  open: boolean
  onClose: () => void
}

/** Global settings: language, coach mode, Hi-Lo counting, shoe penetration, simultaneous boxes. */
export default function SettingsSheet({ open, onClose }: Props) {
  const s = useGame()
  const { settings, t } = s
  const lang = settings.lang

  const seg = <T extends string | number>(
    opts: { v: T; l: string }[],
    cur: T,
    fn: (v: T) => void,
  ) => (
    <div className="seg">
      {opts.map((o) => (
        <button key={String(o.v)} type="button" className={o.v === cur ? 'on' : ''} onClick={() => fn(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  )

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
            <h2>{t('setTitle')}</h2>

            <h3>{t('setLang')}</h3>
            {seg(
              [
                { v: 'fr', l: 'Français' },
                { v: 'en', l: 'English' },
              ],
              lang,
              (v) => s.setLang(v),
            )}

            <h3>{t('setCoach')}</h3>
            {seg(
              [
                { v: 'live', l: t('coachLive') },
                { v: 'exam', l: t('coachExam') },
              ],
              settings.coachLive ? 'live' : 'exam',
              (v) => s.setCoach(v === 'live'),
            )}

            <h3>{t('setCount')}</h3>
            {seg(
              [
                { v: 'off', l: t('countOff') },
                { v: 'quiz', l: t('countQuizM') },
                { v: 'visible', l: t('countVis') },
              ],
              settings.countMode,
              (v) => s.setCountMode(v),
            )}

            <h3>{t('setPen')}</h3>
            <input
              className="range"
              type="range"
              min={0.5}
              max={0.85}
              step={0.05}
              value={settings.penetration}
              onChange={(e) => s.setPenetration(Number(e.target.value))}
            />
            <div className="mono" style={{ fontSize: '.72rem', color: 'var(--cream-dim)' }}>
              {Math.round(settings.penetration * 100)}% ·{' '}
              {Math.round(settings.decks * 52 * settings.penetration)}/{settings.decks * 52}
            </div>
            <p className="about" style={{ marginTop: 6 }}>
              {t('penB')}
            </p>

            <h3>{t('setBoxes')}</h3>
            {seg(
              [
                { v: 1, l: '1' },
                { v: 2, l: '2' },
                { v: 3, l: '3' },
              ],
              settings.boxes,
              (v) => s.setBoxes(v),
            )}
            <p className="about" style={{ marginTop: 6 }}>
              {t('boxesB')}
            </p>

            <h3>{t('aboutT')}</h3>
            <p className="about">{t('aboutB')}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
