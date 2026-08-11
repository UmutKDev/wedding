import { useEffect } from 'react'
import Lenis from 'lenis'

import { scrollState } from '../store/scroll'
import { usePrefersReducedMotion, useIsTouch } from './useMediaQuery'

/**
 * Kaydırma sürücüsü.
 *
 * 📱 Dokunmatikte Lenis KULLANILMAZ. iOS ve Android'in kendi momentum
 * kaydırması zaten çok iyi; üstüne JS tabanlı yumuşatma bindirmek
 * telefonda gecikmeli ve "yapış yapış" hissettirir, ayrıca sürekli RAF
 * döngüsü pil tüketir. Dokunmatikte yerel kaydırma + pasif dinleyici kullanılır.
 *
 * Masaüstünde ise Lenis'in yumuşak ivmesi farkı yaratan detaylardan biri.
 *
 * Her iki durumda da ilerleme `scrollState` içine yazılır — React render'ı yok.
 */
export function useSmoothScroll(): void {
  const reducedMotion = usePrefersReducedMotion()
  const isTouch = useIsTouch()

  useEffect(() => {
    // ── Dokunmatik veya hareket azaltma: yerel kaydırma ──────────────
    if (isTouch || reducedMotion) {
      let lastY = window.scrollY
      let frame = 0

      const read = () => {
        frame = 0
        const y = window.scrollY
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        scrollState.offset = y
        scrollState.progress = Math.min(1, Math.max(0, y / max))
        scrollState.velocity = y - lastY
        lastY = y
      }

      // rAF ile birleştir: scroll olayı saniyede 100+ kez tetiklenebilir.
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(read)
      }

      read()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', read, { passive: true })

      return () => {
        if (frame) cancelAnimationFrame(frame)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', read)
      }
    }

    // ── Masaüstü: Lenis yumuşak kaydırma ────────────────────────────
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      syncTouch: false,
      autoRaf: false,
    })

    // Geri çağrı Lenis örneğinin kendisini alır.
    const off = lenis.on('scroll', (l: Lenis) => {
      scrollState.offset = l.scroll
      scrollState.progress = l.progress
      scrollState.velocity = l.velocity
    })

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      off?.()
      lenis.destroy()
    }
  }, [isTouch, reducedMotion])
}
