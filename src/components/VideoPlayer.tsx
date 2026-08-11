import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { pickVariant, type VideoSlot } from '../config/media'
import { tr } from '../content/tr'
import { useIsPortrait } from '../hooks/useMediaQuery'
import { useAppStore } from '../store/useAppStore'

interface VideoPlayerProps {
  slot: VideoSlot
  /** Dikey varyantı tercih et (reel bölümü gibi) */
  forcePortrait?: boolean
  className?: string
}

/** iOS Safari yalnızca video elemanına özel tam ekran API'sini destekler. */
interface IosVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void
}

/**
 * Özel kontrollü video oynatıcı.
 *
 * 📱 Mobil kararları:
 *  • `preload="none"` — video ancak görünür olduğunda metadata çeker.
 *    Sayfayı açan herkese onlarca megabaytlık indirme başlatmak, mobil
 *    veriyle gezen misafir için kabul edilemez.
 *  • Kontroller büyük ve az sayıda; tarayıcının yerel kontrolleri
 *    tasarımı bozardı.
 *  • Tam ekran: standart API yoksa iOS'un `webkitEnterFullscreen`
 *    yöntemine düşülür.
 *  • Oynatma sırasında arka plan müziği kısılır.
 */
export function VideoPlayer({ slot, forcePortrait = false, className = '' }: VideoPlayerProps) {
  const video = useRef<HTMLVideoElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const isPortrait = useIsPortrait()
  const setDucked = useAppStore((s) => s.setDucked)

  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  const variant = pickVariant(slot, forcePortrait || isPortrait)

  // Görünür olunca kaynakları yüklemeye başla — önce değil.
  useEffect(() => {
    const el = container.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Oynatma durumu → müzik kısma
  useEffect(() => {
    setDucked(playing)
    return () => setDucked(false)
  }, [playing, setDucked])

  // Görüş alanından çıkınca duraklat — arka planda ses çalmaya devam etmesin
  useEffect(() => {
    const el = container.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.current?.pause()
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const togglePlay = useCallback(() => {
    const el = video.current
    if (!el) return
    if (el.paused) void el.play().catch(() => undefined)
    else el.pause()
  }, [])

  const toggleMute = useCallback(() => {
    const el = video.current
    if (!el) return
    el.muted = !el.muted
    setMuted(el.muted)
  }, [])

  const goFullscreen = useCallback(() => {
    const el = video.current
    const box = container.current
    if (!el || !box) return

    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }

    if (box.requestFullscreen) void box.requestFullscreen().catch(() => undefined)
    else (el as IosVideoElement).webkitEnterFullscreen?.()
  }, [])

  if (!slot.enabled) return <VideoPlaceholder aspect={variant.aspect} className={className} />

  return (
    <div
      ref={container}
      className={`group relative overflow-hidden rounded-[var(--radius-card)] bg-black ${className}`}
      style={{ aspectRatio: variant.aspect }}
    >
      <video
        ref={video}
        className="h-full w-full object-cover"
        poster={variant.poster}
        playsInline
        preload="none"
        disablePictureInPicture
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
      >
        {inView && variant.webm && <source src={variant.webm} type="video/webm" />}
        {inView && variant.mp4 && <source src={variant.mp4} type="video/mp4" />}
      </video>

      {/* Büyük oynat düğmesi — yalnızca duraklatılmışken */}
      <AnimatePresence>
        {!playing && (
          <motion.button
            type="button"
            onClick={togglePlay}
            aria-label={tr.storyFilm.play}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border backdrop-blur-md"
              style={{
                borderColor: 'color-mix(in oklab, var(--color-gold) 55%, transparent)',
                background: 'rgba(7,6,10,0.45)',
              }}
            >
              <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                <path d="M2 2.6a1 1 0 0 1 1.5-.87l16 9.4a1 1 0 0 1 0 1.74l-16 9.4A1 1 0 0 1 2 21.4V2.6Z" fill="var(--color-gold)" />
              </svg>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Alt kontrol çubuğu */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
        <ControlButton onClick={toggleMute} label={muted ? tr.storyFilm.unmute : tr.storyFilm.mute}>
          {muted ? <IconMuted /> : <IconSound />}
        </ControlButton>
        <ControlButton onClick={goFullscreen} label={tr.storyFilm.fullscreen}>
          <IconExpand />
        </ControlButton>
      </div>
    </div>
  )
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // Kontroller videonun üstünde duruyor: sayfa açık temada olsa da
      // ikonlar beyaz kalır, altındaki karenin rengi bilinemez.
      className="tap pointer-events-auto rounded-full text-white transition-colors pointer-fine:hover:text-[var(--color-gold-lit)]"
    >
      {children}
    </button>
  )
}

/** Video dosyası henüz yokken gösterilen zarif boşluk */
function VideoPlaceholder({ aspect, className = '' }: { aspect: string; className?: string }) {
  return (
    <div
      className={`surface flex items-center justify-center ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <svg width="34" height="26" viewBox="0 0 34 26" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="24" height="24" rx="4" stroke="var(--color-gold)" strokeWidth="1" opacity="0.5" />
          <path d="M25 10l8-5v16l-8-5" stroke="var(--color-gold)" strokeWidth="1" opacity="0.5" strokeLinejoin="round" />
        </svg>
        <span className="text-ink-faint text-[0.75rem] tracking-[0.18em] uppercase">
          {tr.storyFilm.unavailable}
        </span>
      </div>
    </div>
  )
}

const IconSound = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 7.5h3L11 4v12L7 12.5H4v-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M13.8 7a4 4 0 0 1 0 6M16 4.8a7 7 0 0 1 0 10.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const IconMuted = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 7.5h3L11 4v12L7 12.5H4v-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M14 8l4 4M18 8l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const IconExpand = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M7.5 2.5h-5v5M12.5 2.5h5v5M12.5 17.5h5v-5M7.5 17.5h-5v-5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
