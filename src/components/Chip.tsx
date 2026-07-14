import { motion } from 'framer-motion'

interface Props {
  value: 5 | 10 | 25 | 50 | 100
  disabled?: boolean
  onAdd: (v: number) => void
}

/** A casino chip. Tapping it adds its value to the bet, with a tactile bounce. */
export default function Chip({ value, disabled, onAdd }: Props) {
  return (
    <motion.button
      type="button"
      className={`chip c${value}`}
      disabled={disabled}
      onClick={() => onAdd(value)}
      whileTap={{ scale: 0.86, y: 3 }}
      whileHover={disabled ? undefined : { y: -3 }}
      transition={{ type: 'spring', stiffness: 600, damping: 20 }}
      aria-label={`Add ${value}`}
    >
      {value}
    </motion.button>
  )
}
