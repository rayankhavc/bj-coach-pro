import { useGame } from '@/store/useGame'

/** FR / EN toggle pill, wired to the shared store. */
export default function LangToggle() {
  const lang = useGame((s) => s.settings.lang)
  const setLang = useGame((s) => s.setLang)
  return (
    <button
      type="button"
      className="pill"
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {lang === 'fr' ? 'FR' : 'EN'} · {lang === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
