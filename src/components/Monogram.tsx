import { motion, useReducedMotion } from 'motion/react'

import { wedding } from '../config/wedding'

interface MonogramProps {
  size?: number
  /** Harflerin çizilme animasyonu oynasın mı? */
  animate?: boolean
  className?: string
}

/**
 * "Ö & B" monogramı — iki halka ve baş harfler.
 *
 * Harfler SVG metni olarak çizilir, `stroke-dasharray` ile "kalemle
 * yazılıyormuş" gibi belirir. Yükleme ekranında ve kapanışta kullanılır.
 */
export function Monogram({ size = 92, animate = false, className = '' }: MonogramProps) {
  const reduced = useReducedMotion()
  const shouldAnimate = animate && !reduced

  const groom = wedding.couple.groom.first.charAt(0)
  const bride = wedding.couple.bride.first.charAt(0)
  const label = `${groom} & ${bride}`

  const draw = (delay: number) =>
    shouldAnimate
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration: 1.6, delay, ease: [0.4, 0, 0.2, 1] as const },
            opacity: { duration: 0.3, delay },
          },
        }
      : {}

  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 160 100"
      fill="none"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="mono-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-lit)" />
          <stop offset="50%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-gold-deep)" />
        </linearGradient>
      </defs>

      {/* İç içe iki halka */}
      <motion.circle
        cx="62"
        cy="50"
        r="30"
        stroke="url(#mono-gold)"
        strokeWidth="1.1"
        {...draw(0)}
      />
      <motion.circle
        cx="98"
        cy="50"
        r="30"
        stroke="url(#mono-gold)"
        strokeWidth="1.1"
        opacity="0.75"
        {...draw(0.25)}
      />

      {/* Baş harfler */}
      <motion.text
        x="80"
        y="59"
        textAnchor="middle"
        fill="url(#mono-gold)"
        style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.06em' }}
        initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : undefined}
        animate={shouldAnimate ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {groom}
        <tspan style={{ fontStyle: 'italic', fontSize: 20 }} dx="4" dy="-2">
          &amp;
        </tspan>
        <tspan dx="4" dy="2">
          {bride}
        </tspan>
      </motion.text>
    </svg>
  )
}
