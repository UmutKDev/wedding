import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { GoldButton } from '../components/GoldButton'
import { Monogram } from '../components/Monogram'
import { Reveal } from '../components/Reveal'
import { media } from '../config/media'
import { wedding } from '../config/wedding'
import { tr } from '../content/tr'
import { shareInvitation } from '../lib/share'
import { useAppStore } from '../store/useAppStore'

const ShareIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 10.5V1.8M8 1.8L5 4.8M8 1.8l3 3M2.5 9v4a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V9"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Kapanış: teşekkür, monogram, paylaşım ve iletişim.
 *
 * Paylaşım düğmesi mobilde yerel paylaşım sayfasını açar (WhatsApp,
 * Mesajlar…); desteklenmeyen yerlerde bağlantıyı panoya kopyalar ve
 * kullanıcıya bunu söyler — sessizce hiçbir şey yapmaz.
 */
export function Closing() {
  const [copied, setCopied] = useState(false)
  const replayIntro = useAppStore((s) => s.replayIntro)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2600)
    return () => clearTimeout(timer)
  }, [copied])

  const onShare = async () => {
    const result = await shareInvitation({
      title: tr.closing.shareTitle,
      text: tr.closing.shareText,
      url: wedding.siteUrl,
    })
    if (result === 'copied') setCopied(true)
  }

  return (
    <section
      id="kapanis"
      className="section-x relative flex flex-col items-center gap-8 py-24 text-center sm:py-32"
      style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}
    >
      <Reveal>
        <Monogram size={116} />
      </Reveal>

      <Reveal delay={0.1}>
        <p className="text-ink font-display text-[clamp(1.375rem,6vw,2rem)] leading-snug">
          {tr.closing.line1}
          <br />
          {tr.closing.line2}
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center gap-3">
            <GoldButton variant="solid" icon={ShareIcon} onClick={onShare}>
              {tr.closing.share}
            </GoldButton>
          </div>

          <span aria-live="polite" className="h-4">
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-gold text-[0.6875rem] tracking-[0.18em] uppercase"
                >
                  {tr.closing.linkCopied}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
      </Reveal>

      {wedding.contact.length > 0 && (
        <Reveal delay={0.28}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-ink-faint text-[0.625rem] tracking-[0.26em] uppercase">
              {tr.closing.contact}
            </span>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {wedding.contact.map((person) => (
                <a
                  key={person.tel}
                  href={`tel:${person.tel}`}
                  className="text-ink-dim pointer-fine:hover:text-gold text-[0.9375rem] transition-colors"
                >
                  {person.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Açılış filmini tekrar izleme — yalnızca film varsa anlamlı */}
      {media.intro.enabled && (
        <Reveal delay={0.4}>
          <button
            type="button"
            onClick={replayIntro}
            className="tap text-ink-faint pointer-fine:hover:text-gold text-[0.625rem] tracking-[0.24em] uppercase transition-colors"
          >
            {tr.intro.replay}
          </button>
        </Reveal>
      )}
    </section>
  )
}
