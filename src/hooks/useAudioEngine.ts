import { useEffect, useRef } from 'react'

import { media } from '../config/media'
import { useAppStore } from '../store/useAppStore'

const FULL_VOLUME = 0.34
/** Video oynarken müziğin ineceği seviye */
const DUCKED_VOLUME = 0.05
const FADE_MS = 260

/**
 * Arka plan müziği.
 *
 * 📱 Mobil gerçekleri:
 *  • iOS ve Android, kullanıcı sayfayla etkileşime girene kadar sesli
 *    oynatmayı engeller. Bu yüzden müzik ancak `audioUnlocked` true
 *    olduktan sonra — yani "Davetiyeyi Aç" dokunuşundan sonra — başlar.
 *  • Bir video oynarken müzik kısılır (ducking), video bitince geri
 *    yükselir. İki ses kaynağının üst üste binmesi en çok telefon
 *    hoparlöründe rahatsız eder.
 *  • Sekme arka plana alınınca durdurulur.
 *  • Ses dosyası yoksa hook hiçbir şey yapmaz.
 */
export function useAudioEngine(): void {
  const audio = useRef<HTMLAudioElement | null>(null)
  const fadeFrame = useRef(0)

  const phase = useAppStore((s) => s.phase)
  const unlocked = useAppStore((s) => s.audioUnlocked)
  const muted = useAppStore((s) => s.muted)
  const ducked = useAppStore((s) => s.ducked)

  // Ses elemanını bir kez oluştur
  useEffect(() => {
    if (!media.audio) return

    const el = new Audio(media.audio)
    el.loop = true
    el.preload = 'auto'
    el.volume = 0
    audio.current = el

    return () => {
      cancelAnimationFrame(fadeFrame.current)
      el.pause()
      el.src = ''
      audio.current = null
    }
  }, [])

  // Oynat / durdur / seviye
  useEffect(() => {
    const el = audio.current
    if (!el) return

    // Açılış filmi kendi sesiyle oynuyor; müzik davetiye başlayınca girer.
    const shouldPlay = unlocked && !muted && phase === 'invitation'
    const target = shouldPlay ? (ducked ? DUCKED_VOLUME : FULL_VOLUME) : 0

    if (shouldPlay && el.paused) {
      void el.play().catch(() => undefined)
    }

    cancelAnimationFrame(fadeFrame.current)

    const from = el.volume
    const start = performance.now()

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS)
      // easeOutQuad — sonu yumuşak, kulakta "kesildi" hissi olmaz
      el.volume = from + (target - from) * (1 - (1 - t) * (1 - t))

      if (t < 1) {
        fadeFrame.current = requestAnimationFrame(step)
      } else if (!shouldPlay) {
        el.pause()
      }
    }

    fadeFrame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(fadeFrame.current)
  }, [unlocked, muted, ducked, phase])

  // Sekme arka plandayken sustur (pil ve nezaket)
  useEffect(() => {
    const el = audio.current
    if (!el) return

    const onVisibility = () => {
      if (document.hidden) el.pause()
      else if (useAppStore.getState().phase === 'invitation' && !useAppStore.getState().muted) {
        void el.play().catch(() => undefined)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
}
