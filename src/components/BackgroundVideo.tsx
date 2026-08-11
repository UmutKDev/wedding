import { useEffect, useRef, useState } from 'react'

import { pickVariant, type VideoSlot } from '../config/media'
import { useIsPortrait, usePrefersReducedData, usePrefersReducedMotion } from '../hooks/useMediaQuery'

interface BackgroundVideoProps {
  slot: VideoSlot
  /** Videonun üstündeki perde yoğunluğu (0–1) — metin okunurluğu için */
  scrim?: number
  /**
   * CSS `object-position`. `object-fit: cover` kadraja sığmayan kısmı
   * kırpar; bu değer HANGİ kısmın kırpılacağını belirler.
   *
   * Dikey ekranda kırpma yataydır, yatay ekranda dikey — dolayısıyla
   * iki eksene birden değer vermek her iki yönelimde de işe yarar.
   */
  objectPosition?: string
  className?: string
}

/**
 * Sessiz, döngüsel arka plan videosu.
 *
 * 📱 Mobil gerçekleri:
 *  • `playsInline` olmadan iOS videoyu tam ekran oynatıcıya alır.
 *  • Düşük Güç Modu'nda iOS sessiz videoların bile otomatik oynatmasını
 *    engeller — `play()` reddedilir. Bu durumda poster karesi kalır ve
 *    hiçbir şey bozulmaz.
 *  • Veri tasarrufu açıksa video hiç indirilmez, sadece poster gösterilir.
 *  • Sekme arka plana alınınca video duraklatılır (pil).
 */
export function BackgroundVideo({
  slot,
  scrim = 0.55,
  objectPosition = 'center',
  className = '',
}: BackgroundVideoProps) {
  const video = useRef<HTMLVideoElement>(null)
  const isPortrait = useIsPortrait()
  const reducedMotion = usePrefersReducedMotion()
  const reducedData = usePrefersReducedData()
  const [ready, setReady] = useState(false)

  const variant = pickVariant(slot, isPortrait)
  const staticOnly = reducedMotion || reducedData

  useEffect(() => {
    const el = video.current
    if (!el || staticOnly) return

    // Otomatik oynatma reddedilebilir; poster'da kalmak kabul edilebilir
    // bir sonuç, bu yüzden hatayı yutuyoruz.
    void el.play().catch(() => undefined)

    const onVisibility = () => {
      if (document.hidden) el.pause()
      else void el.play().catch(() => undefined)
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [staticOnly, variant.mp4, variant.webm])

  if (!slot.enabled) return null

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {!staticOnly && (
        <video
          ref={video}
          className="h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0, objectPosition }}
          poster={variant.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          onCanPlay={() => setReady(true)}
        >
          {variant.webm && <source src={variant.webm} type="video/webm" />}
          {variant.mp4 && <source src={variant.mp4} type="video/mp4" />}
        </video>
      )}

      {/* Poster: video yüklenene kadar ve oynatma engellendiğinde görünür */}
      {variant.poster && (
        <img
          src={variant.poster}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          style={{ objectPosition }}
          loading="eager"
          decoding="async"
        />
      )}

      {/*
        Perde — üstteki metnin her koşulda okunmasını garantiler.
        Açık temada videoyu KARARTMAZ, fildişine doğru yıkar; metin koyu
        olduğu için kontrastı sağlayan şey zeminin açılması.

        `scrim={0}` verilirse hiç render edilmez: çağıran taraf kendi
        perdesini yönetiyor demektir (bkz. Hero — perdenin yönü videonun
        varlığına göre değişiyor).
      */}
      {scrim > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(250,247,242,${scrim * 0.85}) 0%,
              rgba(250,247,242,${scrim * 0.4}) 38%,
              rgba(250,247,242,${Math.min(1, scrim * 1.4)}) 100%)`,
          }}
        />
      )}
    </div>
  )
}
