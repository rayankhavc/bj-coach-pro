import { useMemo } from 'react'
import { useGame } from '@/store/useGame'
import { tr, type TKey } from '@/lib/i18n'

/**
 * Language-aware translator hook. Subscribes to `settings.lang` so any component
 * that renders translated text re-renders when the language changes.
 */
export function useT() {
  const lang = useGame((s) => s.settings.lang)
  return useMemo(() => (k: TKey) => tr(lang, k), [lang])
}
