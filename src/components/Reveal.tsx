import { type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

interface RevealProps {
  children: ReactNode
  /** Saniye cinsinden gecikme */
  delay?: number
  /** Aşağıdan yukarı kayma mesafesi (px) */
  distance?: number
  className?: string
  /** Bir kez mi oynasın, yoksa her görünürlükte mi? */
  once?: boolean
}

/**
 * Görünür olduğunda aşağıdan yumuşakça beliren blok.
 *
 * `whileInView` kullanılır — kaydırma konumunu React'e bağlamaz,
 * IntersectionObserver üzerinden çalışır, dolayısıyla kaydırma sırasında
 * yeniden render tetiklemez.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 24,
  className,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.35, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

interface SplitRevealProps {
  text: string
  className?: string
  /** Harfler arası gecikme (saniye) */
  stagger?: number
  delay?: number
  once?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const

const charVariants: Variants = {
  hidden: { y: '110%', opacity: 0, filter: 'blur(8px)' },
  visible: { y: '0%', opacity: 1, filter: 'blur(0px)' },
}

/**
 * Harf harf beliren başlık.
 *
 * ⚠️ GÖRÜNÜRLÜK TETİĞİ KAPSAYICIDA — harflerde DEĞİL.
 *
 * Her harf `overflow-hidden` bir pencerenin içinde %110 aşağıda başlar.
 * `whileInView`'ı doğrudan harflere verirsek kilitlenme oluşur:
 * IntersectionObserver kesişim alanını üst öğelerin kırpma kutusuna göre
 * hesapladığı için, kırpılmış harf hiçbir zaman "görünür" sayılmaz —
 * animasyon başlamaz, harf de sonsuza dek gizli kalır. (Bu tam olarak
 * başlıkların hiç belirmemesine yol açmıştı.)
 *
 * Doğru kalıp: tetiği kırpılmayan kapsayıcıya bağla, harfleri
 * `staggerChildren` ile sırala.
 *
 * Erişilebilirlik: kapsayıcıya gerçek metin `aria-label` olarak verilir ve
 * harf span'leri `aria-hidden` yapılır — yoksa ekran okuyucular metni harf
 * harf okur.
 */
export function SplitReveal({
  text,
  className,
  stagger = 0.035,
  delay = 0,
  once = true,
  as = 'span',
}: SplitRevealProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{text}</Tag>
  }

  const MotionTag = MOTION_TAGS[as]
  const words = text.split(' ')

  return (
    <MotionTag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.25, margin: '0px 0px -8% 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, wi) => (
        // Kelime bütün hâlinde sarılır ki satır sonu kelimeyi ortadan bölmesin.
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap" aria-hidden="true">
          {Array.from(word).map((char, ci) => (
            <span key={ci} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                variants={charVariants}
                transition={{ duration: 0.85, ease: EASE }}
              >
                {char}
              </motion.span>
            </span>
          ))}
          {/* Kelime arası boşluk — sonuncudan sonra yok */}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </MotionTag>
  )
}
