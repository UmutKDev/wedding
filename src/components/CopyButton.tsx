import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { copyText } from '../lib/maps'

interface CopyButtonProps {
  /** Panoya kopyalanacak metin */
  value: string
  label: string
  copiedLabel: string
  className?: string
}

/**
 * Metni panoya kopyalayan düğme, geri bildirimli.
 *
 * Onay mesajı düğmenin yerini almaz; yanında belirir. Düğme metninin
 * değişmesi genişliği oynatır ve etrafındaki düzen zıplar — telefonda
 * bu çok göze batar.
 */
export function CopyButton({ value, label, copiedLabel, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2200)
    return () => clearTimeout(timer)
  }, [copied])

  const onClick = async () => {
    if (await copyText(value)) setCopied(true)
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="tap text-ink-dim pointer-fine:hover:text-gold gap-2 text-[0.75rem] tracking-[0.14em] uppercase transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="9.5" height="9.5" rx="1.8" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M11 3.4V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v6.5A1.5 1.5 0 0 0 3 11h.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        {label}
      </button>

      <span aria-live="polite" className="min-w-0">
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-gold text-[0.6875rem] tracking-[0.14em] uppercase"
            >
              {copiedLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}
