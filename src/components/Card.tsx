import { motion } from 'framer-motion'
import type { Card as TCard } from '@/lib/engine'

interface Props {
  card?: TCard
  hidden?: boolean
  /** deal-order index for the cascade stagger */
  index?: number
}

/** A single playing card, animated in on mount (cascade deal). */
export default function Card({ card, hidden, index = 0 }: Props) {
  const anim = {
    initial: { opacity: 0, y: -14, rotate: -3 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    transition: { duration: 0.22, delay: Math.min(index, 6) * 0.07, ease: 'easeOut' as const },
  }

  if (hidden || !card) {
    return <motion.div className="card back" aria-label="face-down card" {...anim} />
  }

  const red = card.s === '♥' || card.s === '♦'
  const corner = (
    <>
      <span className="r">{card.r}</span>
      <small>{card.s}</small>
    </>
  )
  return (
    <motion.div
      className={'card' + (red ? ' red' : '')}
      role="img"
      aria-label={`${card.r} ${card.s}`}
      {...anim}
    >
      <div className="ix">{corner}</div>
      <div className="mid">{card.s}</div>
      <div className="ix b">{corner}</div>
    </motion.div>
  )
}
