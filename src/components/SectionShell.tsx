import { type ReactNode } from 'react'

import { Reveal, SplitReveal } from './Reveal'

interface SectionShellProps {
  id: string
  eyebrow?: string
  title?: string
  children: ReactNode
  /** İçerik genişliği — varsayılan okunabilir sütun */
  width?: 'narrow' | 'wide' | 'full'
  className?: string
  /** Bölümü ekran yüksekliğine sabitle (hero benzeri bölümler için) */
  full?: boolean
}

const WIDTHS = {
  narrow: 'max-w-[34rem]',
  wide: 'max-w-[64rem]',
  full: 'max-w-none',
} as const

/**
 * Tüm bölümlerin ortak kabuğu: dikey ritim, başlık düzeni, güvenli alan.
 *
 * 📱 Dikey boşluklar mobilde bilinçli olarak daha dar (py-20) — telefonda
 * cömert beyaz alan "ferah" değil "boş" hissettirir ve kullanıcıyı gereksiz
 * kaydırmaya zorlar.
 */
export function SectionShell({
  id,
  eyebrow,
  title,
  children,
  width = 'narrow',
  className = '',
  full = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`section-x relative py-20 sm:py-28 lg:py-36 ${full ? 'min-h-dvh' : ''} ${className}`}
    >
      <div className={`mx-auto w-full ${WIDTHS[width]}`}>
        {(eyebrow || title) && (
          <header className="mb-10 flex flex-col items-center gap-4 text-center sm:mb-14">
            {eyebrow && (
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="rule-gold w-8 sm:w-12" />
                  <span className="eyebrow">{eyebrow}</span>
                  <span className="rule-gold w-8 sm:w-12" />
                </div>
              </Reveal>
            )}
            {title && (
              <SplitReveal
                as="h2"
                text={title}
                className="text-title font-display text-ink"
                stagger={0.025}
              />
            )}
          </header>
        )}

        {children}
      </div>
    </section>
  )
}
