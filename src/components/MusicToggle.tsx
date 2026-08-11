import { AnimatePresence, motion } from 'motion/react'

import { media } from '../config/media'
import { tr } from '../content/tr'
import { useAppStore } from '../store/useAppStore'

const BARS = [0, 1, 2, 3]

/**
 * Müzik aç/kapat düğmesi.
 *
 * 📱 Sağ altta, başparmağın doğal olarak ulaştığı bölgede; ana ekran
 * çubuğunun üstünde kalması için güvenli alan payı eklenir. Dokunma
 * hedefi 44×44'ten küçük olmaz.
 *
 * Müzik dosyası yoksa hiç render edilmez — çalışmayan bir düğme
 * göstermek, düğme olmamasından kötüdür.
 */
export function MusicToggle() {
  const phase = useAppStore((s) => s.phase)
  const muted = useAppStore((s) => s.muted)
  const toggleMuted = useAppStore((s) => s.toggleMuted)

  if (!media.audio) return null

  const visible = phase === 'invitation'
  const playing = !muted

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toggleMuted}
          aria-label={playing ? tr.audio.on : tr.audio.off}
          aria-pressed={playing}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="tap fixed right-4 z-50 rounded-full border border-[color-mix(in_oklab,var(--color-gold)_35%,transparent)] bg-[rgba(255,255,255,0.82)] shadow-[0_2px_14px_-4px_rgb(43_39_36/0.22)] backdrop-blur-md"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
            {BARS.map((i) => (
              <motion.span
                key={i}
                className="w-[2px] rounded-full bg-[var(--color-gold)]"
                animate={
                  playing
                    ? { height: ['30%', '100%', '45%', '85%', '30%'] }
                    : { height: '18%' }
                }
                transition={
                  playing
                    ? {
                        duration: 1.1 + i * 0.18,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.09,
                      }
                    : { duration: 0.3 }
                }
                style={{ height: '30%' }}
              />
            ))}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
