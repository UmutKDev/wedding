import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { wedding } from '../config/wedding'
import { tr } from '../content/tr'
import { useCountdown } from '../hooks/useCountdown'
import { pad2 } from '../lib/format'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Büyük güne geri sayım.
 *
 * Tarih geçtikten sonra sayaç anlamsızlaşır ve davetiye "ölü" görünür;
 * bu yüzden o an bölüm kendini "Evlendik" kutlamasına çevirir ve birlikte
 * geçen günleri saymaya başlar. Davetiye linki düğünden sonra da paylaşılır.
 */
export function Countdown() {
  const c = useCountdown(wedding.countdownTarget)

  if (c.isPast) {
    return (
      <SectionShell id="geri-sayim">
        <div className="flex flex-col items-center gap-5 text-center">
          <Reveal>
            <h2 className="text-foil text-display font-display">
              {tr.countdown.marriedTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-gold-plain font-display text-[clamp(3rem,16vw,6rem)] leading-none">
                {c.daysSince}
              </span>
              <span className="text-ink-dim text-eyebrow tracking-[0.28em] uppercase">
                {tr.countdown.marriedSince}
              </span>
            </div>
          </Reveal>
        </div>
      </SectionShell>
    )
  }

  const cells = [
    { value: c.days, label: tr.countdown.days, pad: false },
    { value: c.hours, label: tr.countdown.hours, pad: true },
    { value: c.minutes, label: tr.countdown.minutes, pad: true },
    { value: c.seconds, label: tr.countdown.seconds, pad: true },
  ]

  return (
    <SectionShell id="geri-sayim" eyebrow={tr.countdown.eyebrow} width="wide">
      {/*
        Ekran okuyucular için tek, sakin bir özet. Sayaç hücreleri
        `aria-hidden` — saniyede bir değişen dört ayrı sayıyı okumak
        işkenceye dönerdi.
      */}
      <p className="sr-only" aria-live="polite">
        {`Düğüne ${c.days} gün ${c.hours} saat kaldı`}
      </p>

      <Reveal>
        <div
          className="mx-auto grid max-w-[30rem] grid-cols-4 gap-2 sm:gap-4"
          aria-hidden="true"
        >
          {cells.map((cell) => (
            <Cell
              key={cell.label}
              value={cell.pad ? pad2(cell.value) : String(cell.value)}
              label={cell.label}
            />
          ))}
        </div>
      </Reveal>

      {c.isToday && (
        <Reveal delay={0.2}>
          <p className="text-gold mt-8 text-center text-[0.75rem] tracking-[0.3em] uppercase">
            {tr.countdown.today}
          </p>
        </Reveal>
      )}
    </SectionShell>
  )
}

/**
 * Tek bir sayaç hücresi.
 *
 * Rakam değiştiğinde eskisi yukarı süzülüp çıkar, yenisi aşağıdan gelir —
 * mekanik "flip" saatlerin dijital karşılığı. `overflow-hidden` bir pencere
 * gibi davranır, hareket sadece hücrenin içinde olur.
 */
function Cell({ value, label }: { value: string; label: string }) {
  const reduced = useReducedMotion()

  return (
    <div className="surface flex flex-col items-center gap-1 px-1 py-4 sm:gap-2 sm:py-6">
      {/*
        Cormorant eski usul (metin) rakamları kullanır: 3, 4, 7, 9 taban
        çizgisinin altına iner, 1 ve 2 küçük kalır. Fontta `lnum` özelliği
        bulunmadığı için bu değiştirilemiyor — ama zaten değiştirmek de
        istemezdik: klasik davetiye tipografisinin imzası tam olarak budur.
        Hücreler eşit genişlikte olduğu için hizalama sorunu doğurmuyor.
      */}
      <span className="relative block h-[1.05em] overflow-hidden text-[clamp(1.75rem,9vw,3.25rem)] leading-none">
        {reduced ? (
          <span className="text-gold-plain font-display block">{value}</span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              className="text-gold-plain font-display block"
              initial={{ y: '105%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-105%', opacity: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        )}
      </span>

      <span className="text-ink-faint text-[0.5625rem] tracking-[0.18em] uppercase sm:text-[0.6875rem] sm:tracking-[0.22em]">
        {label}
      </span>
    </div>
  )
}
