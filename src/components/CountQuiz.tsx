import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/store/useGame'
import { useT } from '@/hooks/useT'

/** Hidden-count quiz: periodically asks the player for the running count. */
export default function CountQuiz() {
  const open = useGame((s) => s.quizOpen)
  const quiz = useGame((s) => s.quiz)
  const step = useGame((s) => s.quizStep)
  const submit = useGame((s) => s.quizSubmit)
  const t = useT()

  const sign = (n: number) => (n > 0 ? '+' : '') + n

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <h2>{t('quizT')}</h2>
            <p>{t('quizQ')}</p>
            <div className="stepper">
              <button type="button" onClick={() => step(-1)} aria-label="minus">
                −
              </button>
              <b className="mono">{sign(quiz.ans)}</b>
              <button type="button" onClick={() => step(1)} aria-label="plus">
                +
              </button>
            </div>
            {quiz.done && (
              <p style={{ display: 'block' }}>
                {quiz.diff === 0 ? (
                  <b style={{ color: 'var(--ok)' }}>
                    {t('quizExact')}
                    {sign(quiz.rc)}
                  </b>
                ) : (
                  <b style={{ color: 'var(--bad)' }}>
                    {t('quizOff')}
                    {sign(quiz.rc)} ({t('offBy')} {quiz.diff})
                  </b>
                )}
                <br />
                <span className="mono" style={{ fontSize: '.72rem' }}>
                  TC ≈ {quiz.tc > 0 ? '+' : ''}
                  {quiz.tc.toFixed(1)}
                </span>
              </p>
            )}
            <button type="button" className="abtn a-deal" style={{ width: '100%' }} onClick={submit}>
              {quiz.done ? t('cont') : t('check')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
