import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useGame } from '@/store/useGame'
import { trueCount } from '@/lib/engine'
import { fmt } from '@/lib/i18n'
import Toast from './Toast'
import SettingsSheet from './SettingsSheet'
import StatsReport from './StatsReport'
import InsuranceModal from './InsuranceModal'
import CountQuiz from './CountQuiz'
import HandSummary from './HandSummary'

const navItems = [
  { to: '/', key: 'navHome' as const, end: true },
  { to: '/play', key: 'navGame' as const, end: false },
  { to: '/drill', key: 'navDrill' as const, end: false },
  { to: '/strategy', key: 'navStrategy' as const, end: false },
  { to: '/learn', key: 'navLearn' as const, end: false },
  { to: '/about', key: 'navAbout' as const, end: false },
]

export default function Layout({ children }: { children: ReactNode }) {
  const s = useGame()
  const { bank, settings, rc, shoe, t } = s
  const lang = settings.lang
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)

  let countBadge: string
  if (settings.countMode === 'visible') {
    const tc = trueCount(rc, shoe.length)
    countBadge = `RC ${rc > 0 ? '+' : ''}${rc} · TC ${tc > 0 ? '+' : ''}${tc.toFixed(1)}`
  } else if (settings.countMode === 'quiz') {
    countBadge = `🂠 ${t('rcHidden')}`
  } else {
    countBadge = `${t('shoeLbl')} ${shoe.length}`
  }

  return (
    <div className="wrap">
      <header className="app-header">
        <div className="h-top">
          <Link to="/" className="brand">
            BJ Coach <span style={{ color: 'var(--cream-dim)' }}>Pro</span>
            <small>{t('hSub')}</small>
          </Link>
          <div className="bank">{fmt(bank, lang)}</div>
        </div>
        <div className="h-bar">
          <button
            type="button"
            className="pill"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('openSettings')}
          >
            ⚙
          </button>
          <button type="button" className="pill" onClick={() => s.setCoach(!settings.coachLive)}>
            {t('coach')} : {settings.coachLive ? t('live') : t('exam')}
          </button>
          <button type="button" className="pill" onClick={() => setStatsOpen(true)}>
            {t('stats')}
          </button>
          <span className="count-badge">{countBadge}</span>
          <button
            type="button"
            className="pill"
            onClick={() => s.setLang(lang === 'fr' ? 'en' : 'fr')}
            aria-label="language"
          >
            {lang === 'fr' ? 'FR·EN' : 'EN·FR'}
          </button>
        </div>
      </header>

      <nav className="nav">
        {navItems.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'on' : '')}>
            {t(it.key)}
          </NavLink>
        ))}
      </nav>

      <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>{children}</main>

      <footer className="app-footer">
        <div>{t('foot')}</div>
        <div className="made" style={{ marginTop: 6 }}>
          {t('madeBy')}
        </div>
      </footer>

      {/* global overlays (driven by shared state) */}
      <Toast />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <StatsReport open={statsOpen} onClose={() => setStatsOpen(false)} />
      <InsuranceModal />
      <CountQuiz />
      <HandSummary onOpenStats={() => setStatsOpen(true)} />
    </div>
  )
}
