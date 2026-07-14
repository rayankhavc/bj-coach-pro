import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '@/store/useGame'

export default function Home() {
  const lang = useGame((s) => s.settings.lang)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const features = [
    {
      t: L('Stratégie de base', 'Basic strategy'),
      d: L(
        'Moteur 6 jeux · S17 · DAS · BJ 3:2, avec coaching immédiat ou mode examen.',
        '6-deck · S17 · DAS · BJ 3:2 engine, with instant coaching or exam mode.',
      ),
    },
    {
      t: L('Comptage Hi-Lo', 'Hi-Lo counting'),
      d: L(
        'Sabot honnête à pénétration réglable, running count et true count, quiz caché.',
        'Honest shoe with adjustable penetration, running & true count, hidden quiz.',
      ),
    },
    {
      t: L('Drill éclair adaptatif', 'Adaptive flash drill'),
      d: L(
        'Les situations reviennent plus souvent sur tes erreurs passées.',
        'Situations are weighted toward your past mistakes.',
      ),
    },
  ]

  return (
    <div className="table-main" style={{ paddingBottom: 48 }}>
      <div className="prose" style={{ textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 8 }}
        >
          BJ Coach Pro
        </motion.h1>
        <p style={{ fontSize: '1rem' }}>
          {L(
            "Le simulateur de blackjack qui t'apprend vraiment à jouer : stratégie de base parfaite, comptage Hi-Lo et débrief de chaque décision. Bilingue, sans argent réel.",
            'The blackjack simulator that actually teaches you to play: perfect basic strategy, Hi-Lo counting and a debrief of every decision. Bilingual, no real money.',
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', margin: '20px 0' }}>
        <Link to="/play" className="abtn a-deal" style={{ flex: '1 1 140px', textAlign: 'center', padding: '14px' }}>
          {L('Jouer maintenant', 'Play now')}
        </Link>
        <Link to="/drill" className="abtn a-spl" style={{ flex: '1 1 140px', textAlign: 'center', padding: '14px' }}>
          {L('Drill éclair', 'Flash drill')}
        </Link>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
        <Link to="/strategy" className="abtn a-ghost" style={{ flex: '1 1 140px', textAlign: 'center', padding: '12px' }}>
          {L('Voir le tableau', 'View the chart')}
        </Link>
        <Link to="/learn" className="abtn a-ghost" style={{ flex: '1 1 140px', textAlign: 'center', padding: '12px' }}>
          {L('Apprendre les règles', 'Learn the rules')}
        </Link>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            style={{
              background: '#1d150c',
              border: '1px solid rgba(201,162,75,.2)',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--brass)', marginBottom: 3 }}
            >
              {f.t}
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--cream-dim)', lineHeight: 1.45 }}>{f.d}</div>
          </motion.div>
        ))}
      </div>

      <p
        className="prose"
        style={{ fontSize: '.76rem', textAlign: 'center', marginTop: 22, color: 'var(--cream-dim)' }}
      >
        {L(
          'Outil pédagogique. Aucun argent réel, aucun compte. La stratégie parfaite laisse encore ~0,5 % au casino.',
          'Training tool. No real money, no account. Perfect strategy still leaves the house ~0.5%.',
        )}
      </p>
    </div>
  )
}
