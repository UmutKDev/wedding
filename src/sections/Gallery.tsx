import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { Photo } from '../components/Photo'
import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { wedding, type GalleryItem } from '../config/wedding'
import { tr } from '../content/tr'

/**
 * Anılar — tek seferde bir fotoğraf gösteren slider.
 *
 * 📱 Altta yatan mekanizma yerel `scroll-snap`: parmakla kaydırma
 * iOS/Android'in kendi momentum fiziğini kullanır, birebir ve akıcıdır.
 * Sağ/sol oklar aynı şeridi programatik olarak kaydırır — yani iki ayrı
 * gezinme yolu değil, tek bir kaynağın iki arayüzü. Kendi sürükleme
 * mantığımızı yazsaydık dokunmatikte yerelin altında kalırdı.
 *
 * Fotoğrafa dokunmak tam ekran görüntüleyiciyi açar.
 */
export function Gallery() {
  const items = wedding.gallery
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [openAt, setOpenAt] = useState<number | null>(null)
  // Dosyası bulunamayan fotoğraflar — üstlerine açıklama bindirmiyoruz.
  const [missing, setMissing] = useState<ReadonlySet<string>>(() => new Set())

  /* Aktif slaytı kaydırma konumundan oku. Ok düğmeleri ve parmakla
     kaydırma aynı durumu beslediği için ikisi hiçbir zaman ayrışmaz. */
  useEffect(() => {
    const el = track.current
    if (!el) return

    let frame = 0
    const read = () => {
      frame = 0
      setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  /*
   * ⚠️ `scrollTo({ behavior: 'smooth' })` BURADA ÇALIŞMIYOR.
   *
   * `scroll-snap-type: x mandatory` ile tarayıcının kendi yumuşak kaydırma
   * animasyonu çakışıyor: snap mantığı animasyonu ilk karede iptal ediyor
   * ve şerit hiç kımıldamıyor (`behavior` olmadan aynı çağrı sorunsuz
   * çalışıyor — sorun tam olarak bu ikisinin birlikteliği).
   *
   * Çözüm: kaydırmayı kendimiz tween'liyoruz. Animasyon boyunca snap
   * geçici olarak kapatılıyor (yoksa ara değerler her karede en yakın
   * noktaya çekilip hareketi tırtıklı yapardı), bitince geri açılıyor.
   * Böylece parmakla kaydırmanın yerel snap davranışı da korunuyor.
   */
  const animation = useRef(0)

  const goTo = useCallback(
    (target: number) => {
      const el = track.current
      if (!el) return

      const clamped = Math.max(0, Math.min(items.length - 1, target))
      const from = el.scrollLeft
      const to = clamped * el.clientWidth
      if (Math.abs(to - from) < 1) return

      cancelAnimationFrame(animation.current)

      const restoreSnap = () => {
        el.style.scrollSnapType = ''
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.scrollLeft = to
        return
      }

      el.style.scrollSnapType = 'none'
      const start = performance.now()
      const duration = 420

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
        el.scrollLeft = from + (to - from) * eased

        if (t < 1) {
          animation.current = requestAnimationFrame(step)
        } else {
          restoreSnap()
        }
      }

      animation.current = requestAnimationFrame(step)
    },
    [items.length],
  )

  // Bileşen sökülürse yarım kalan tween'i durdur.
  useEffect(() => () => cancelAnimationFrame(animation.current), [])

  if (items.length === 0) return null

  const atStart = index <= 0
  const atEnd = index >= items.length - 1

  return (
    <SectionShell id="anilar" eyebrow={tr.gallery.eyebrow} title={tr.gallery.title} width="wide">
      <Reveal>
        <div className="relative mx-auto w-full max-w-[28rem]">
          <div
            ref={track}
            className="flex snap-x snap-mandatory overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setOpenAt(i)}
                className="group relative w-full shrink-0 snap-center overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  aspectRatio: '3 / 4',
                  border: '1px solid color-mix(in oklab, var(--color-gold) 22%, transparent)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <Photo
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-700 pointer-fine:group-hover:scale-[1.04]"
                  onFailed={() => setMissing((prev) => new Set(prev).add(item.src))}
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

          {/* Oklar — tek fotoğrafta hiç render edilmez */}
          {items.length > 1 && (
            <>
              <SliderArrow
                direction="left"
                label={tr.gallery.prev}
                disabled={atStart}
                onClick={() => goTo(index - 1)}
              />
              <SliderArrow
                direction="right"
                label={tr.gallery.next}
                disabled={atEnd}
                onClick={() => goTo(index + 1)}
              />
            </>
          )}
        </div>
      </Reveal>

      {/* Noktalar — hem konum göstergesi hem doğrudan gezinme */}
      {items.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={tr.gallery.counter(i + 1, items.length)}
              aria-current={i === index}
              className="tap !min-h-[1.75rem] !min-w-[1.75rem]"
            >
              <span
                className="block rounded-full transition-all duration-400"
                style={{
                  width: i === index ? '1.35rem' : '0.4rem',
                  height: '0.4rem',
                  background:
                    i === index
                      ? 'var(--color-gold)'
                      : 'color-mix(in oklab, var(--color-gold) 30%, transparent)',
                }}
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox items={items} index={openAt} onClose={() => setOpenAt(null)} onNavigate={setOpenAt} />
    </SectionShell>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

interface SliderArrowProps {
  direction: 'left' | 'right'
  label: string
  disabled: boolean
  onClick: () => void
}

/** Fotoğrafın kenarına oturan yuvarlak ok düğmesi. */
function SliderArrow({ direction, label, disabled, onClick }: SliderArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`tap absolute top-1/2 z-10 -translate-y-1/2 rounded-full backdrop-blur-md transition-opacity duration-300 ${
        direction === 'left' ? 'left-2' : 'right-2'
      } ${disabled ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      style={{
        background: 'rgba(255,255,255,0.86)',
        border: '1px solid color-mix(in oklab, var(--color-gold) 32%, transparent)',
        boxShadow: '0 2px 14px -4px rgb(43 39 36 / 0.28)',
      }}
    >
      <Chevron direction={direction} />
    </button>
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
 * Açıkken sayfa kaydırması kilitlenir; odak kapatma düğmesine verilir ve
 * Esc her zaman çalışır.
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
          <div
            className="flex items-center justify-between px-4"
            style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
          >
            {/* "1 / 1" bilgi taşımaz — tek fotoğrafta sayaç gösterilmez. */}
            <span className="text-ink-faint text-[0.75rem] tracking-[0.2em] tabular-nums">
              {items.length > 1 ? tr.gallery.counter(index + 1, items.length) : ''}
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

          <div
            className="flex items-center justify-between gap-4 px-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            {/*
              Gezinme okları yalnızca gidilecek başka fotoğraf varsa.
              Tek fotoğrafta `go()` modulo 1 yüzünden hep aynı kareye
              döner — hiçbir şey yapmayan iki düğme kalırdı.
            */}
            {items.length > 1 && (
              <button type="button" onClick={() => go(-1)} aria-label={tr.gallery.prev} className="tap text-ink">
                <Chevron direction="left" />
              </button>
            )}

            {item.caption && (
              <p className="text-ink-dim flex-1 text-center text-[0.8125rem]">{item.caption}</p>
            )}

            {items.length > 1 && (
              <button type="button" onClick={() => go(1)} aria-label={tr.gallery.next} className="tap text-ink">
                <Chevron direction="right" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path
        d="M9 5l7 7-7 7"
        stroke="var(--color-gold-deep)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
