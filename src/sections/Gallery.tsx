import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { Photo } from '../components/Photo'
import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { wedding, type GalleryItem } from '../config/wedding'
import { tr } from '../content/tr'
import { useIsTouch } from '../hooks/useMediaQuery'

/** Bu sayıya kadar ızgara, üstünde kaydırmalı şerit gösterilir. */
const GRID_LIMIT = 3

/**
 * Anılar — fotoğraf bölümü.
 *
 * İki düzen var ve seçim fotoğraf sayısına göre otomatik:
 *
 *  • **3 veya daha az** → ortalanmış ızgara. Az sayıda fotoğrafı yatay
 *    şeride koymak yanlış bir vaat verir: kullanıcı kaydırılacak bir
 *    şeyler olduğunu sanır, iki kare görüp durur.
 *  • **4 ve üzeri** → yatay `scroll-snap` şeridi. Bu bilinçli bir tercih:
 *    planlanan 3B silindirik karusel masaüstünde etkileyici olurdu ama
 *    dokunmatikte sürükleme hareketi sayfanın dikey kaydırmasıyla
 *    çakışıyor. Yerel `scroll-snap` ise iOS/Android'in gerçek momentum
 *    fiziğini kullanır: parmağın altında birebir, akıcı ve bedava.
 *
 * Her iki düzende de fotoğrafa dokununca aynı tam ekran görüntüleyici açılır.
 */
export function Gallery() {
  const items = wedding.gallery
  const [openAt, setOpenAt] = useState<number | null>(null)
  // Dosyası bulunamayan fotoğraflar — üstlerine açıklama bindirmiyoruz.
  const [missing, setMissing] = useState<ReadonlySet<string>>(() => new Set())
  const isTouch = useIsTouch()

  if (items.length === 0) return null

  const asGrid = items.length <= GRID_LIMIT

  return (
    <SectionShell
      id="anilar"
      eyebrow={tr.gallery.eyebrow}
      title={tr.gallery.title}
      width={asGrid ? 'wide' : 'full'}
    >
      <Reveal>
        <div
          className={
            asGrid
              ? 'mx-auto grid max-w-[46rem] gap-4 sm:grid-cols-2'
              : 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 sm:gap-4'
          }
          style={
            asGrid
              ? undefined
              : {
                  scrollbarWidth: 'none',
                  // Şeridin kenarları ekrana taşsın: bir sonraki fotoğrafın
                  // ucunun görünmesi "kaydırılabilir" olduğunu anlatır.
                  paddingInline: 'max(1.25rem, calc((100vw - 64rem) / 2))',
                }
          }
        >
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setOpenAt(i)}
              className={`group relative overflow-hidden rounded-[var(--radius-card)] ${
                asGrid ? '' : 'shrink-0 snap-center'
              }`}
              style={{
                ...(asGrid ? {} : { width: 'min(74vw, 22rem)' }),
                aspectRatio: '3 / 4',
                border: '1px solid color-mix(in oklab, var(--color-gold) 22%, transparent)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <Photo
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-700 pointer-fine:group-hover:scale-[1.04]"
                onFailed={() =>
                  setMissing((prev) => new Set(prev).add(item.src))
                }
              />
              {/*
                Fotoğrafın ÜSTÜNDEKİ yazı, sayfa açık temada olsa bile
                koyu perde üzerinde beyaz kalır: altındaki fotoğrafın
                rengi bilinmiyor, tek garantili okunurluk bu.
              */}
              {item.caption && !missing.has(item.src) && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-10 pb-3 text-left text-[0.8125rem] text-white">
                  {item.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      {/* İpucu yalnızca gerçekten kaydırılacak bir şey varsa */}
      {!asGrid && (
        <p className="text-ink-faint mt-2 text-center text-[0.625rem] tracking-[0.24em] uppercase">
          {isTouch ? tr.gallery.hintTouch : tr.gallery.hintPointer}
        </p>
      )}

      <Lightbox items={items} index={openAt} onClose={() => setOpenAt(null)} onNavigate={setOpenAt} />
    </SectionShell>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

interface LightboxProps {
  items: readonly GalleryItem[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/**
 * Tam ekran fotoğraf görüntüleyici.
 *
 * Klavye (← → Esc), dokunmatik kaydırma ve düğmelerle gezilir.
 * Açıkken sayfa kaydırması kilitlenir ve odak tuzağı kurulmaz — bunun
 * yerine kapatma düğmesine odak verilir ve Esc her zaman çalışır.
 */
function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null
  const closeButton = useRef<HTMLButtonElement>(null)
  const touchStartX = useRef(0)

  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      onNavigate((index + delta + items.length) % items.length)
    },
    [index, items.length, onNavigate],
  )

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    closeButton.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, go, onClose])

  const item = index !== null ? items[index] : null

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col bg-[rgba(250,247,242,0.97)] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1)
          }}
        >
          {/* Üst çubuk */}
          <div
            className="flex items-center justify-between px-4"
            style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
          >
            <span className="text-ink-faint text-[0.75rem] tracking-[0.2em] tabular-nums">
              {tr.gallery.counter(index + 1, items.length)}
            </span>
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              aria-label={tr.gallery.close}
              className="tap text-ink"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Fotoğraf */}
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-2">
            <motion.img
              key={item.src}
              src={item.src}
              alt={item.alt}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>

          {/* Alt çubuk */}
          <div
            className="flex items-center justify-between gap-4 px-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <button type="button" onClick={() => go(-1)} aria-label={tr.gallery.prev} className="tap text-ink">
              <Chevron direction="left" />
            </button>

            {item.caption && (
              <p className="text-ink-dim flex-1 text-center text-[0.8125rem]">{item.caption}</p>
            )}

            <button type="button" onClick={() => go(1)} aria-label={tr.gallery.next} className="tap text-ink">
              <Chevron direction="right" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
