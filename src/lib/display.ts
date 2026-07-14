import { handValue, type Card } from './engine'

/** "12 / 22" for a soft hand under 21, otherwise the single best total. */
export function totalStr(cards: Card[]): string {
  const { total, soft } = handValue(cards)
  return soft && total < 21 ? `${total - 10} / ${total}` : String(total)
}
