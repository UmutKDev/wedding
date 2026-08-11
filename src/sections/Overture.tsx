import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { Monogram } from '../components/Monogram'
import { WaxSeal } from '../components/WaxSeal'
import { media, pickVariant } from '../config/media'
import { tr } from '../content/tr'
import { useIsPortrait } from '../hooks/useMediaQuery'
import { useAppStore } from '../store/useAppStore'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Açılış sekansı: yükleme → mühürlü zarf → açılış filmi → davetiye.
 *
 * Zarfa dokunmak sadece dramatik bir jest değil, teknik bir gereklilik:
 * mobil tarayıcılar sesli oynatmayı ancak kullanıcı hareketinden sonra
 * serbest bırakır. O dokunuş hem filmi hem müziği açan anahtardır.
 */
export function Overture() {
  const phase = useAppStore((s) => s.phase)
  const setPhase = useAppStore((s) => s.setPhase)
  const beginInvitation = useAppStore((s) => s.beginInvitation)
  const unlockAudio = useAppStore((s) => s.unlockAudio)
  const introSeen = useAppStore((s) => s.introSeen)
  const reduced = useReducedMotion()

  // Yükleme ekranından zarfa geçiş.
  useEffect(() => {
    if (phase !== 'loading') return

    // Daha önce izlemiş ziyaretçiyi bekletme — doğrudan davetiyeye al.
    // Hareket azaltma tercihinde de açılış sekansı atlanır.
    if (introSeen || reduced) {
      setPhase('invitation')
      return
    }

    // Fontlar hazır olana kadar bekle (monogram ve isimler yerine otursun),
    // ama en fazla 2.5 sn — yavaş bağlantıda ziyaretçi ekranda kalmasın.
    let done = false
    const go = () => {
      if (done) return
      done = true
      setPhase('envelope')
    }

    const timeout = setTimeout(go, 2500)
    void document.fonts?.ready.then(() => setTimeout(go, 500)).catch(go)

    return () => clearTimeout(timeout)
  }, [phase, introSeen, reduced, setPhase])

  const openInvitation = () => {
    // Ses kilidini bu dokunuş açar.
    unlockAudio()
    if (media.intro.enabled) setPhase('intro')
    else beginInvitation()
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'loading' && <Loading key="loading" />}
      {phase === 'envelope' && <Envelope key="envelope" onOpen={openInvitation} />}
      {phase === 'intro' && <IntroFilm key="intro" onFinish={beginInvitation} />}
    </AnimatePresence>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

// `select-none`: açılış ekranında yanlışlıkla metin seçilmesi (basılı
// tutma / çift dokunma) davetiyenin ilk anını bozuyor.
const overlayClass =
  'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper section-x select-none'

function Loading() {
  return (
    <motion.div
      className={overlayClass}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <Monogram size={140} animate />
      <motion.p
        className="text-ink-faint mt-8 text-[0.6875rem] tracking-[0.32em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        {tr.loading.preparing}
      </motion.p>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

function Envelope({ onOpen }: { onOpen: () => void }) {
  // Ses vaadi yalnızca gerçekten ses varsa verilir — açılış filmi veya
  // arka plan müziği yoksa "ses açık olacak" demek yanlış olur.
  const hasSound = media.intro.enabled || Boolean(media.audio)

  return (
    <motion.div
      className={overlayClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE }}
      >
        <p className="eyebrow">{tr.envelope.eyebrow}</p>

        <Monogram size={138} className="mt-9" />

        <button
          type="button"
          onClick={onOpen}
          className="group mt-14 flex flex-col items-center gap-5"
        >
          <WaxSeal size={82} />

          <span className="text-ink font-display text-[1.375rem] tracking-[0.16em]">
            {tr.envelope.open}
          </span>

          {hasSound && (
            <span className="text-ink-faint text-[0.625rem] tracking-[0.24em] uppercase">
              {tr.envelope.hint}
            </span>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */

function IntroFilm({ onFinish }: { onFinish: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const isPortrait = useIsPortrait()
  const [canSkip, setCanSkip] = useState(false)
  const variant = pickVariant(media.intro, isPortrait)

  useEffect(() => {
    // "Atla" hemen görünürse açılış anını bozar; birkaç saniye sonra gelir.
    const timer = setTimeout(() => setCanSkip(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const el = video.current
    if (!el) return

    /*
     * Sesli oynatma denenir. Zarfa dokunulduğu için normalde izin verilir;
     * yine de reddedilirse (ör. iOS Düşük Güç Modu) sessize alıp tekrar
     * denenir. İkisi de olmazsa film atlanır — ziyaretçi siyah ekranda
     * kalmaz.
     */
    void el.play().catch(() => {
      el.muted = true
      void el.play().catch(onFinish)
    })
  }, [onFinish])

  return (
    <motion.div
      className="bg-paper fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.12, filter: 'blur(16px)' }}
      transition={{ duration: 1, ease: EASE }}
    >
      <video
        ref={video}
        className="h-full w-full object-cover"
        poster={variant.poster}
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        onEnded={onFinish}
        onError={onFinish}
      >
        {variant.webm && <source src={variant.webm} type="video/webm" />}
        {variant.mp4 && <source src={variant.mp4} type="video/mp4" />}
      </video>

      <AnimatePresence>
        {canSkip && (
          <motion.button
            type="button"
            onClick={onFinish}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="tap text-ink absolute right-4 rounded-full border border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)] bg-[rgba(250,247,242,0.86)] px-5 text-[0.75rem] tracking-[0.2em] uppercase backdrop-blur-md"
            style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            {tr.intro.skip}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
