import { useGame } from '@/store/useGame'

export default function Learn() {
  const lang = useGame((s) => s.settings.lang)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  return (
    <div className="table-main" style={{ paddingBottom: 48 }}>
      <div className="prose">
        <h1>{L('Comprendre le blackjack', 'Understanding blackjack')}</h1>
        <p>
          {L(
            "Le blackjack est le jeu de casino où la décision du joueur compte le plus. Voici d'où il vient, comment il se joue, et pourquoi les règles changent d'une table à l'autre.",
            'Blackjack is the casino game where player decisions matter most. Here is where it comes from, how it is played, and why the rules change from one table to the next.',
          )}
        </p>

        <h2>{L('Origines', 'Origins')}</h2>
        <p>
          {L(
            "Le blackjack descend du « vingt-et-un » français (vingt-et-un), popularisé dans les maisons de jeu françaises au XVIIIᵉ siècle, lui-même cousin de jeux espagnols et italiens plus anciens. Le principe est déjà là : approcher 21 sans le dépasser.",
            'Blackjack descends from the French game "vingt-et-un" (twenty-one), popular in French gambling houses in the 18th century, itself a cousin of older Spanish and Italian games. The core idea was already there: get close to 21 without going over.',
          )}
        </p>
        <p>
          {L(
            "En arrivant aux États-Unis au XIXᵉ siècle, le jeu a du mal à s'imposer. Les casinos offrent alors des primes pour attirer les joueurs, dont un paiement spécial quand la main de départ combine un As et un valet noir (« black jack » — le valet de pique ou de trèfle). La prime a disparu, mais le nom « blackjack » est resté.",
            'When the game reached the United States in the 19th century, it struggled to catch on. Casinos offered bonuses to attract players — including a special payout when the opening hand combined an Ace with a black Jack (the "black jack" — of spades or clubs). The bonus disappeared, but the name "blackjack" stuck.',
          )}
        </p>

        <h2>{L('Les règles universelles', 'The universal rules')}</h2>
        <ul>
          <li>
            <strong>{L('Objectif', 'Goal')} :</strong>{' '}
            {L(
              "battre le croupier en approchant 21 sans le dépasser. Dépasser 21, c'est « sauter » (bust) et perdre aussitôt.",
              'beat the dealer by getting closer to 21 without going over. Going over 21 is a "bust" and an immediate loss.',
            )}
          </li>
          <li>
            <strong>{L('Valeur des cartes', 'Card values')} :</strong>{' '}
            {L(
              "2 à 10 valent leur nombre, les figures (V, D, R) valent 10, l'As vaut 1 ou 11 au choix — c'est ce qui rend une main « souple ».",
              '2–10 are worth their number, face cards (J, Q, K) are worth 10, and the Ace is worth 1 or 11 — whichever helps, which is what makes a hand "soft".',
            )}
          </li>
          <li>
            <strong>{L('Déroulement', 'Flow')} :</strong>{' '}
            {L(
              'tu mises, reçois deux cartes, et le croupier en montre une (l\'autre est cachée). Tu choisis : tirer, rester, doubler, séparer une paire.',
              'you bet, receive two cards, and the dealer shows one (the other is face down). You choose: hit, stand, double, or split a pair.',
            )}
          </li>
          <li>
            <strong>{L('Le croupier', 'The dealer')} :</strong>{' '}
            {L(
              "n'a aucun choix : il tire jusqu'à atteindre au moins 17, puis s'arrête. C'est cette contrainte que la stratégie de base exploite.",
              'has no choices: they draw until reaching at least 17, then stop. Basic strategy exploits exactly this constraint.',
            )}
          </li>
          <li>
            <strong>{L('Le blackjack', 'A blackjack')} :</strong>{' '}
            {L(
              'un As + une carte à 10 dès les deux premières cartes. Il paie généralement 3:2 et bat toute autre main de 21.',
              'an Ace + a 10-value card on the first two cards. It usually pays 3:2 and beats any other 21.',
            )}
          </li>
        </ul>

        <h2>{L('Les variantes qui changent tout', 'The variants that change everything')}</h2>
        <p>
          {L(
            "Deux tables de blackjack ne sont presque jamais identiques. Chaque règle déplace l'avantage de la maison de quelques dixièmes de pour cent — assez pour transformer un bon jeu en mauvais.",
            'No two blackjack tables are quite alike. Each rule shifts the house edge by a few tenths of a percent — enough to turn a good game into a bad one.',
          )}
        </p>
        <ul>
          <li>
            <strong>S17 vs H17 :</strong>{' '}
            {L(
              'si le croupier reste sur 17 souple (S17), c\'est mieux pour toi ; s\'il tire sur 17 souple (H17), la maison gagne ~0,2 % de plus. Cet outil simule S17.',
              'if the dealer stands on soft 17 (S17) it favors you; if they hit soft 17 (H17) the house gains ~0.2% more. This tool simulates S17.',
            )}
          </li>
          <li>
            <strong>{L('Double après séparation (DAS)', 'Double after split (DAS)')} :</strong>{' '}
            {L(
              "pouvoir doubler après avoir séparé une paire t'avantage d'environ 0,15 %. Ici, le DAS est autorisé.",
              'being able to double after splitting a pair helps you by about 0.15%. Here, DAS is allowed.',
            )}
          </li>
          <li>
            <strong>{L('Nombre de jeux', 'Number of decks')} :</strong>{' '}
            {L(
              "moins il y a de jeux, mieux c'est pour le joueur. Un seul jeu peut retirer ~0,5 % à la maison par rapport à six ou huit.",
              'fewer decks are better for the player. A single deck can cut the house edge by ~0.5% versus six or eight.',
            )}
          </li>
          <li>
            <strong>{L('Règle européenne (sans carte cachée)', 'European (no hole card)')} :</strong>{' '}
            {L(
              "en Europe, le croupier ne prend souvent sa seconde carte qu'après tes décisions. Tu risques donc de perdre tes mises de double/séparation s'il révèle un blackjack — un léger désavantage.",
              "in Europe the dealer often takes their second card only after your decisions. You can then lose your double/split wagers if they reveal a blackjack — a small disadvantage.",
            )}
          </li>
          <li>
            <strong>{L('Abandon (surrender)', 'Surrender')} :</strong>{' '}
            {L(
              "pouvoir abandonner la moitié de ta mise sur une main désespérée (comme 16 contre As) réduit tes pertes. Cet outil ne le propose pas.",
              'being able to forfeit half your bet on a hopeless hand (like 16 vs Ace) cuts your losses. This tool does not offer it.',
            )}
          </li>
          <li>
            <strong>{L('Paiement du blackjack', 'Blackjack payout')} :</strong>{' '}
            {L(
              "3:2 est correct. Méfie-toi des tables 6:5 : elles ajoutent ~1,4 % à l'avantage du casino. Ici, c'est 3:2.",
              '3:2 is fair. Beware of 6:5 tables: they add ~1.4% to the house edge. Here, it is 3:2.',
            )}
          </li>
        </ul>

        <h2>{L('Un mot honnête sur le comptage', 'An honest word on card counting')}</h2>
        <p>
          {L(
            "Compter les cartes, c'est suivre la proportion de hautes cartes (10, figures, As) encore dans le sabot. Quand elles sont surreprésentées, le joueur a un léger avantage : plus de blackjacks, un croupier qui saute plus souvent. Le système Hi-Lo (+1 pour 2-6, 0 pour 7-9, −1 pour 10/figures/As) donne un « running count », qu'on divise par le nombre de jeux restants pour obtenir le « true count ».",
            'Counting cards means tracking the proportion of high cards (10s, faces, Aces) still in the shoe. When they are over-represented, the player gains a slight edge: more blackjacks, a dealer who busts more often. The Hi-Lo system (+1 for 2-6, 0 for 7-9, −1 for 10/faces/Aces) gives a "running count", which you divide by the decks remaining to get the "true count".',
          )}
        </p>
        <p>
          {L(
            "C'est parfaitement légal : tu utilises ta tête, pas un appareil. Mais les casinos sont des entreprises privées et n'aiment pas les joueurs gagnants. Ils se protègent : pénétration réduite (on mélange plus tôt), mélangeurs continus (CSM) qui rendent le comptage impossible, surveillance vidéo, et le droit de refuser de te servir.",
            'It is perfectly legal: you use your head, not a device. But casinos are private businesses and dislike winning players. They protect themselves: reduced penetration (shuffling earlier), continuous shuffling machines (CSMs) that make counting impossible, camera surveillance, and the right to refuse your play.',
          )}
        </p>
        <p>
          {L(
            "C'est pour ça que la pénétration compte, et que cet outil la rend réglable : plus le sabot est distribué avant le mélange, plus le comptage a de la valeur pédagogique.",
            'That is why penetration matters, and why this tool makes it adjustable: the deeper the shoe is dealt before shuffling, the more meaningful counting practice becomes.',
          )}
        </p>

        <div
          className="advice"
          style={{ marginTop: 24 }}
        >
          {L(
            "Rappel clair : ceci est un outil d'entraînement. Aucun argent réel, aucun compte. Même jouée à la perfection, la stratégie de base laisse ~0,5 % d'avantage au casino — sur la durée, la maison gagne. L'objectif ici est d'apprendre à décider juste, pas de t'inciter à parier.",
            'A clear reminder: this is a training tool. No real money, no account. Even played perfectly, basic strategy leaves the house a ~0.5% edge — over time, the house wins. The goal here is to learn to decide correctly, not to encourage you to gamble.',
          )}
        </div>
      </div>
    </div>
  )
}
