import { useGame } from '@/store/useGame'

export default function About() {
  const lang = useGame((s) => s.settings.lang)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  return (
    <div className="table-main" style={{ paddingBottom: 48 }}>
      <div className="prose">
        <h1>{L('À propos', 'About')}</h1>
        <p>
          {L(
            "BJ Coach Pro est un simulateur d'entraînement au blackjack conçu pour apprendre la stratégie de base parfaite et le comptage Hi-Lo, sans jamais miser d'argent réel. Chaque décision est comparée au coup optimal et expliquée.",
            'BJ Coach Pro is a blackjack training simulator built to teach perfect basic strategy and Hi-Lo counting, without ever wagering real money. Every decision is compared to the optimal play and explained.',
          )}
        </p>

        <h2>{L('Les règles simulées', 'The simulated rules')}</h2>
        <p>
          {L(
            '6 jeux, le croupier reste sur 17 souple (S17), double après séparation autorisé (DAS), blackjack payé 3:2, pas d\'abandon. Le tableau intégré et le moteur de coaching correspondent exactement à ces règles.',
            '6 decks, dealer stands on soft 17 (S17), double after split allowed (DAS), blackjack pays 3:2, no surrender. The built-in chart and the coaching engine match these rules exactly.',
          )}
        </p>

        <h2>{L('Confidentialité', 'Privacy')}</h2>
        <p>
          {L(
            "100 % côté client : aucun compte, aucun serveur, aucune donnée envoyée. Ta session (bankroll, statistiques, erreurs) est sauvegardée uniquement dans ton navigateur via localStorage.",
            '100% client-side: no account, no server, no data sent anywhere. Your session (bankroll, stats, mistakes) is saved only in your browser via localStorage.',
          )}
        </p>

        <h2>{L('Rappel honnête', 'An honest reminder')}</h2>
        <p>
          {L(
            "La stratégie de base parfaite laisse encore ~0,5 % d'avantage au casino. Elle sert à perdre le moins possible, pas à gagner. Cet outil est éducatif : il ne t'encourage pas à jouer de l'argent réel.",
            "Perfect basic strategy still leaves the house a ~0.5% edge. It's about losing the least, not winning. This tool is educational: it does not encourage you to gamble real money.",
          )}
        </p>

        <p style={{ marginTop: 28, color: 'var(--brass)', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>
          {L('Fait par Raythan', 'Made by Raythan')}
        </p>
      </div>
    </div>
  )
}
