import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/store/useGame'
import { useT } from '@/hooks/useT'

/** Insurance prompt shown when the dealer's up-card is an Ace. */
export default function InsuranceModal() {
  const open = useGame((s) => s.insuranceOpen)
  const answer = useGame((s) => s.answerInsurance)
  const t = useT()

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
            <h2>{t('insTitle')}</h2>
            <p>{t('insBody')}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="abtn a-ghost" onClick={() => answer(true)}>
                {t('take')}
              </button>
              <button type="button" className="abtn a-deal" onClick={() => answer(false)}>
                {t('refuse')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
