/* ================================================================
   BJ COACH PRO — bilingual strings + language-parameterised text
   Pure (no React, no DOM). All UI text flows through here.
   ================================================================ */
import { cardValue, handValue, type Card, type Situation, type Action } from './engine'

export type Lang = 'fr' | 'en'

const pickL =
  (lang: Lang) =>
  (fr: string, en: string): string =>
    lang === 'fr' ? fr : en

export interface Bi {
  fr: string
  en: string
}

/* ---------- static UI dictionary ---------- */
export const T = {
  hSub: { fr: "table d'entraînement", en: 'training table' },
  navGame: { fr: 'Table de jeu', en: 'Play' },
  navDrill: { fr: 'Drill éclair', en: 'Flash drill' },
  coach: { fr: 'Coach', en: 'Coach' },
  live: { fr: 'LIVE', en: 'LIVE' },
  exam: { fr: 'EXAMEN', en: 'EXAM' },
  chart: { fr: 'Tableau', en: 'Chart' },
  stats: { fr: 'Bilan', en: 'Report' },
  dealer: { fr: 'Croupier', en: 'Dealer' },
  you: { fr: 'Toi', en: 'You' },
  divider: { fr: 'CROUPIER RESTE SUR 17 · BJ PAIE 3:2', en: 'DEALER STANDS ON 17 · BJ PAYS 3:2' },
  bet: { fr: 'Mise', en: 'Bet' },
  clear: { fr: 'Effacer', en: 'Clear' },
  deal: { fr: 'Distribuer', en: 'Deal' },
  reload: { fr: 'Recharger 1 000 €', en: 'Reload €1,000' },
  placeBet: { fr: 'Place ta mise pour commencer.', en: 'Place your bet to start.' },
  hit: { fr: 'Tirer', en: 'Hit' },
  stand: { fr: 'Rester', en: 'Stand' },
  dbl: { fr: 'Doubler', en: 'Double' },
  split: { fr: 'Séparer', en: 'Split' },
  newHand: { fr: 'Nouvelle main', en: 'New hand' },
  recap: { fr: 'Débrief', en: 'Recap' },
  won: { fr: 'Gagnée ✓', en: 'Won ✓' },
  lost: { fr: 'Perdue ✗', en: 'Lost ✗' },
  push: { fr: 'Égalité', en: 'Push' },
  bjWin: { fr: 'BLACKJACK 3:2', en: 'BLACKJACK 3:2' },
  bust: { fr: ' — sauté', en: ' — bust' },
  handN: { fr: 'main', en: 'hand' },
  betLbl: { fr: 'mise', en: 'bet' },
  shoeLbl: { fr: 'sabot', en: 'shoe' },
  shoeShuf: { fr: 'Sabot mélangé', en: 'Shoe shuffled' },
  shoeShufB: { fr: '6 jeux remis en place', en: '6 decks back in play' },
  goodCall: { fr: '✓ Bon choix — ', en: '✓ Good call — ' },
  mistakeT: { fr: '✗ Erreur — il fallait ', en: '✗ Mistake — correct play: ' },
  hintT: { fr: 'Conseil : ', en: 'Advice: ' },
  hintNote: { fr: ' (décision exclue de ta précision)', en: ' (excluded from your accuracy)' },
  insTitle: { fr: 'Assurance ?', en: 'Insurance?' },
  insBody: {
    fr: "Le croupier montre un As. L'assurance coûte la moitié de ta mise et paie 2:1 s'il a un blackjack.",
    en: 'The dealer shows an Ace. Insurance costs half your bet and pays 2:1 if they have blackjack.',
  },
  take: { fr: 'Prendre', en: 'Take' },
  refuse: { fr: 'Refuser', en: 'Refuse' },
  insGood: { fr: '✓ Bon réflexe', en: '✓ Right call' },
  insBad: { fr: '✗ Erreur — il fallait refuser', en: '✗ Mistake — always refuse' },
  insSitu: { fr: 'Assurance (croupier montre As)', en: 'Insurance (dealer shows Ace)' },
  sumTitle: { fr: 'Débrief de la main', en: 'Hand recap' },
  sumDec: { fr: 'Tes décisions', en: 'Your decisions' },
  sumNone: { fr: 'Aucune décision (blackjack immédiat).', en: 'No decisions (instant blackjack).' },
  hadTo: { fr: 'Il fallait : ', en: 'Correct play: ' },
  replay: { fr: 'Rejouer', en: 'Replay' },
  coaching: { fr: 'Coaching', en: 'Coaching' },
  statsTitle: { fr: 'Bilan du coach', en: 'Coach report' },
  accuracy: { fr: 'Précision', en: 'Accuracy' },
  decisions: { fr: 'Décisions', en: 'Decisions' },
  handsWLP: { fr: 'Mains G / P / E', en: 'Hands W / L / P' },
  net: { fr: 'Résultat net', en: 'Net result' },
  bjs: { fr: 'Blackjacks', en: 'Blackjacks' },
  bank: { fr: 'Bankroll', en: 'Bankroll' },
  bestStreak: { fr: 'Meilleure série', en: 'Best streak' },
  countQuizL: { fr: 'Quiz comptage', en: 'Count quizzes' },
  byCat: { fr: 'Précision par catégorie', en: 'Accuracy by category' },
  catHard: { fr: 'Durs', en: 'Hard' },
  catSoft: { fr: 'Souples', en: 'Soft' },
  catPair: { fr: 'Paires', en: 'Pairs' },
  catIns: { fr: 'Assurance', en: 'Insurance' },
  catDrill: { fr: 'Drill', en: 'Drill' },
  sparkT: { fr: 'Bankroll', en: 'Bankroll' },
  mistT: { fr: 'Erreurs à corriger', en: 'Mistakes to fix' },
  noMist: { fr: 'Aucune erreur enregistrée. 👌', en: 'No mistakes recorded. 👌' },
  playV: { fr: 'jouer', en: 'play' },
  copyBtn: { fr: 'Copier le bilan', en: 'Copy report' },
  copied: { fr: 'Copié !', en: 'Copied!' },
  resetBtn: { fr: 'Réinitialiser la session', en: 'Reset session' },
  sessReset: { fr: 'Session réinitialisée', en: 'Session reset' },
  sessResetB: {
    fr: "Bankroll remise à 1 000 €. En vrai, ce bouton n'existe pas.",
    en: "Bankroll back to €1,000. In real life, this button doesn't exist.",
  },
  chartT: { fr: 'Stratégie de base', en: 'Basic strategy' },
  tabHard: { fr: 'Dur', en: 'Hard' },
  tabSoft: { fr: 'Souple', en: 'Soft' },
  tabPair: { fr: 'Paires', en: 'Pairs' },
  lgHit: { fr: 'Tirer', en: 'Hit' },
  lgStand: { fr: 'Rester', en: 'Stand' },
  lgDh: { fr: 'Doubler (sinon tirer)', en: 'Double (else hit)' },
  lgDs: { fr: 'Doubler (sinon rester)', en: 'Double (else stand)' },
  lgSplit: { fr: 'Séparer', en: 'Split' },
  setTitle: { fr: 'Réglages', en: 'Settings' },
  setLang: { fr: 'Langue', en: 'Language' },
  setCoach: { fr: 'Mode coach', en: 'Coach mode' },
  coachLive: { fr: 'Feedback immédiat', en: 'Instant feedback' },
  coachExam: { fr: 'Examen (débrief à la fin)', en: 'Exam (recap at the end)' },
  setCount: { fr: 'Comptage Hi-Lo', en: 'Hi-Lo counting' },
  countOff: { fr: 'Désactivé', en: 'Off' },
  countQuizM: { fr: 'Quiz (caché)', en: 'Quiz (hidden)' },
  countVis: { fr: 'Visible', en: 'Visible' },
  countOnB: {
    fr: 'Nouveau sabot pour partir d\'un compte à zéro. Petites cartes (2-6) : +1 · 7-9 : 0 · 10/figures/As : −1.',
    en: 'Fresh shoe to start from a zero count. Low cards (2-6): +1 · 7-9: 0 · 10/faces/Aces: −1.',
  },
  countT: { fr: 'Comptage', en: 'Counting' },
  setPen: { fr: 'Pénétration du sabot', en: 'Shoe penetration' },
  penB: {
    fr: 'Profondeur de distribution avant mélange. Plus c\'est profond, plus le comptage a de la valeur.',
    en: 'How deep the shoe is dealt before shuffling. Deeper = counting matters more.',
  },
  setBoxes: { fr: 'Mains simultanées', en: 'Simultaneous hands' },
  boxesB: {
    fr: 'Joue jusqu\'à 3 boxes en parallèle, comme à une vraie table.',
    en: 'Play up to 3 boxes in parallel, like a real table.',
  },
  aboutT: { fr: 'À propos', en: 'About' },
  aboutB: {
    fr: "Règles simulées : 6 jeux, le croupier reste sur 17 souple (S17), double après séparation autorisé (DAS), blackjack payé 3:2, pas d'abandon. Le tableau intégré et le moteur de coaching correspondent exactement à ces règles. Rappel : la stratégie de base parfaite laisse ~0,5 % d'avantage au casino — elle sert à perdre le moins possible, pas à gagner. Session sauvegardée dans ton navigateur (localStorage).",
    en: 'Simulated rules: 6 decks, dealer stands on soft 17 (S17), double after split allowed (DAS), blackjack pays 3:2, no surrender. The built-in chart and the coaching engine match these rules exactly. Reminder: perfect basic strategy still leaves the house a ~0.5% edge — it minimizes losses, it doesn\'t make you a winner. Session saved in your browser (localStorage).',
  },
  quizT: { fr: 'Quiz comptage', en: 'Count quiz' },
  quizQ: { fr: 'Quel est le running count actuel ?', en: "What's the current running count?" },
  check: { fr: 'Valider', en: 'Check' },
  cont: { fr: 'Continuer', en: 'Continue' },
  quizExact: { fr: 'Exact ! RC = ', en: 'Spot on! RC = ' },
  quizOff: { fr: 'RC réel : ', en: 'Actual RC: ' },
  offBy: { fr: 'écart', en: 'off by' },
  drillSub: {
    fr: 'Réponds le plus vite possible. Les situations reviennent plus souvent sur tes erreurs passées.',
    en: 'Answer as fast as you can. Situations are weighted toward your past mistakes.',
  },
  yourMove: { fr: 'Ton coup ?', en: 'Your move?' },
  next: { fr: 'Suivant', en: 'Next' },
  gotIt: { fr: 'Compris', en: 'Got it' },
  score: { fr: 'Score', en: 'Score' },
  streak: { fr: 'Série', en: 'Streak' },
  best: { fr: 'Record', en: 'Best' },
  sugBet: { fr: 'mise conseillée', en: 'suggested bet' },
  minBet: { fr: 'mise minimum', en: 'minimum bet' },
  modeLiveB: { fr: 'Feedback immédiat après chaque décision.', en: 'Instant feedback after every decision.' },
  modeExamB: {
    fr: 'Aucun feedback pendant la main : débrief complet à la fin, comme en vrai.',
    en: 'No feedback during the hand: full recap at the end, like the real thing.',
  },
  kbHint: {
    fr: 'Clavier : 1 Tirer · 2 Rester · 3 Doubler · 4 Séparer · Entrée Distribuer/Suivant',
    en: 'Keys: 1 Hit · 2 Stand · 3 Double · 4 Split · Enter Deal/Next',
  },
  foot: {
    fr: "BJ COACH PRO · 6D · S17 · DAS · OUTIL D'ENTRAÎNEMENT — AUCUN ARGENT RÉEL",
    en: 'BJ COACH PRO · 6D · S17 · DAS · TRAINING TOOL — NO REAL MONEY',
  },
  mode: { fr: 'Mode', en: 'Mode' },
  rcHidden: { fr: 'comptage actif', en: 'counting on' },
  madeBy: { fr: 'Fait par Raythan', en: 'Made by Raythan' },
  chartQuiz: { fr: 'Quiz tableau', en: 'Chart quiz' },
  chartShow: { fr: 'Voir le tableau', en: 'Show chart' },
  chartQuizHint: {
    fr: 'Devine le bon coup pour la case surlignée.',
    en: 'Guess the correct play for the highlighted cell.',
  },
  chartScore: { fr: 'Score quiz', en: 'Quiz score' },
  navHome: { fr: 'Accueil', en: 'Home' },
  navStrategy: { fr: 'Tableau', en: 'Chart' },
  navLearn: { fr: 'Apprendre', en: 'Learn' },
  navAbout: { fr: 'À propos', en: 'About' },
  openSettings: { fr: 'Réglages', en: 'Settings' },
} as const

export type TKey = keyof typeof T

export const tr = (lang: Lang, key: TKey): string => T[key][lang]

/* ---------- language-parameterised game text ---------- */
export const actName = (a: Action | 'refuse', lang: Lang): string => {
  const L = pickL(lang)
  const m: Record<string, string> = {
    H: L('TIRER', 'HIT'),
    S: L('RESTER', 'STAND'),
    D: L('DOUBLER', 'DOUBLE'),
    P: L('SÉPARER', 'SPLIT'),
    refuse: L('REFUSER', 'REFUSE'),
  }
  return m[a] ?? a
}

export const dName = (v: number, lang: Lang): string =>
  v === 11 ? pickL(lang)('As', 'Ace') : v === 10 ? '10/fig' : String(v)

export function situLabel(si: Situation, lang: Lang): string {
  const L = pickL(lang)
  const vs = ' vs ' + dName(COLS_LOCAL[si.col], lang)
  if (si.cat === 'pair') return L('Paire de ', 'Pair of ') + (si.row === 11 ? L('As', 'Aces') : si.row) + vs
  if (si.cat === 'soft') return L('Souple ', 'Soft ') + si.row + ' (A+' + (si.row - 11) + ')' + vs
  return L('', 'Hard ') + si.row + L(' dur', '') + vs
}

const COLS_LOCAL = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export function explain(cards: Card[], dv: number, rec: Action, lang: Lang): string {
  const L = pickL(lang)
  const dl = dName(dv, lang)
  const { total, soft } = handValue(cards)
  const isPair = cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1])
  if (rec === 'P') {
    const v = cardValue(cards[0])
    if (v === 11)
      return L(
        `Deux mains qui démarrent sur un As, chacune peut atteindre 21. On sépare toujours les As.`,
        `Two hands each starting with an Ace, each can reach 21. Always split Aces.`,
      )
    if (v === 8)
      return L(
        `16 est la pire main du jeu. Deux mains à 8 sont bien plus rentables : on sépare toujours les 8.`,
        `16 is the worst hand in the game. Two hands starting on 8 are far more profitable: always split 8s.`,
      )
    if (v === 9)
      return L(
        `18 ne suffit pas contre ${dl} ; deux mains à 9 rapportent plus.`,
        `18 isn't enough against ${dl}; two hands on 9 earn more.`,
      )
    return L(
      `Contre ${dl}, séparer transforme une main médiocre en deux mains jouables (double après split autorisé).`,
      `Against ${dl}, splitting turns a mediocre hand into two playable ones (double after split allowed).`,
    )
  }
  if (isPair && cardValue(cards[0]) === 10 && rec === 'S')
    return L(`20 est quasi imbattable. On ne sépare jamais les 10.`, `20 is nearly unbeatable. Never split 10s.`)
  if (isPair && cardValue(cards[0]) === 5 && rec === 'D')
    return L(
      `On ne sépare jamais les 5 : c'est un 10, parfait pour doubler contre ${dl}.`,
      `Never split 5s: it's a 10, perfect for doubling against ${dl}.`,
    )
  if (soft) {
    if (rec === 'D')
      return L(
        `Ton As est flexible (1 ou 11) : impossible de sauter sur une carte. Le croupier montre ${dl}, une carte faible → double.`,
        `Your Ace is flexible (1 or 11): you can't bust on one card. The dealer shows ${dl}, a weak card → double.`,
      )
    if (total >= 19) return L(`${total} souple est une main forte : reste.`, `Soft ${total} is a strong hand: stand.`)
    if (total === 18)
      return rec === 'S'
        ? L(`18 souple tient la route contre ${dl} : reste.`, `Soft 18 holds up against ${dl}: stand.`)
        : L(
            `18 perd trop souvent contre ${dl}. L'As rend le tirage sans risque de saut : tente d'améliorer.`,
            `18 loses too often against ${dl}. The Ace makes hitting bust-proof: try to improve.`,
          )
    return L(
      `Main souple faible : l'As t'empêche de sauter, tire pour l'améliorer.`,
      `Weak soft hand: the Ace protects you from busting, hit to improve it.`,
    )
  }
  if (total <= 8)
    return L(
      `Impossible de sauter avec ${total} : tire, la main est trop faible pour rester.`,
      `You can't bust with ${total}: hit, the hand is far too weak to stand.`,
    )
  if (rec === 'D')
    return L(
      `Une seule carte te donne 17–21 très souvent, et ${dl} met le croupier en difficulté : doubler maximise ton gain.`,
      `One card very often gives you 17–21, and ${dl} puts the dealer in trouble: doubling maximizes your win.`,
    )
  if (total >= 9 && total <= 11)
    return L(
      `Pas assez d'avantage pour doubler contre ${dl}, mais la main doit s'améliorer : tire.`,
      `Not enough edge to double against ${dl}, but the hand must improve: hit.`,
    )
  if (total === 12)
    return rec === 'S'
      ? L(
          `Le croupier montre ${dl} : il devra tirer et saute souvent. Ne prends aucun risque : reste.`,
          `The dealer shows ${dl}: they must draw and often bust. Take zero risk: stand.`,
        )
      : L(
          `Exception : contre ${dl} le croupier saute moins souvent, et 12 est trop faible. Tire.`,
          `Exception: against ${dl} the dealer busts less often, and 12 is too weak. Hit.`,
        )
  if (total <= 16)
    return rec === 'S'
      ? L(
          `Croupier faible (${dl}) : laisse-le prendre le risque de sauter à ta place. Reste.`,
          `Weak dealer (${dl}): let them take the bust risk instead of you. Stand.`,
        )
      : L(
          `Avec ${dl}, le croupier finit sur 17+ la plupart du temps. Rester = perdre presque à coup sûr : tire, même si ça peut sauter.`,
          `With ${dl}, the dealer ends on 17+ most of the time. Standing = almost guaranteed loss: hit, even if you might bust.`,
        )
  return L(
    `On ne tire jamais sur 17 dur ou plus : le risque de sauter est bien trop élevé.`,
    `Never hit hard 17 or more: the bust risk is far too high.`,
  )
}

export const insExpl = (lang: Lang): string =>
  pickL(lang)(
    `L'assurance a une espérance d'environ −7 % : le croupier n'a un 10 caché que ~31 % du temps. On refuse toujours, même avec un blackjack.`,
    `Insurance has roughly −7% expected value: the dealer hides a 10 only ~31% of the time. Always refuse, even holding a blackjack.`,
  )

/** Format a currency amount for the active language. */
export const fmt = (n: number, lang: Lang): string =>
  n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 }) + ' €'
