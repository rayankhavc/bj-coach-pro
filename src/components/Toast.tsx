import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/store/useGame'

/** Global feedback toast. Auto-dismisses after ~4.2s; tap to dismiss early. */
export default function Toast() {
  const toast = useGame((s) => s.toast)
  const hideToast = useGame((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(hideToast, 4200)
    return () => clearTimeout(id)
  }, [toast, hideToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={`toast ${toast.kind}`}
          role="status"
          onClick={hideToast}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22 }}
        >
          <div className="verdict">{toast.title}</div>
          {toast.body && <p>{toast.body}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
