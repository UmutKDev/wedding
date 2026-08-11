import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'

import { Photo } from '../components/Photo'
import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { wedding } from '../config/wedding'
import { tr } from '../content/tr'

/**
 * Hikâye zaman tüneli.
 *
 * Altın çizgi kaydırma ilerlemesiyle yukarıdan aşağı "çizilir" — okuyucu
 * ilerledikçe hikâye de ilerliyormuş hissi verir.
 *
 * 📱 Telefonda düğümler tek sütun, çizgi solda; tabletten itibaren çizgi
 * ortaya alınıp düğümler iki yana serpilir. Dar ekranda ortadan bölünmüş
 * bir timeline her iki tarafta da 140px'lik sütunlar bırakır ve okunmaz.
 */
export function Story() {
  const track = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ['start 82%', 'end 55%'],
  })

  // Yay ile yumuşat: ham kaydırma değeri çizgiyi tırtıklı ilerletir.
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const height = useTransform(drawn, (v) => `${v * 100}%`)

  if (wedding.story.length === 0) return null

  return (
    <SectionShell id="hikayemiz" eyebrow={tr.story.eyebrow} title={tr.story.title} width="wide">
      <div ref={track} className="relative mx-auto max-w-[46rem] pl-10 sm:pl-0">
        {/* Çizginin sönük yatağı */}
        <div
          className="absolute top-0 bottom-0 left-[0.9375rem] w-px sm:left-1/2 sm:-translate-x-1/2"
          style={{ background: 'color-mix(in oklab, var(--color-gold) 14%, transparent)' }}
          aria-hidden="true"
        />
        {/* Çizilen altın kısım */}
        <motion.div
          className="absolute top-0 left-[0.9375rem] w-px sm:left-1/2 sm:-translate-x-1/2"
          style={{
            height,
            background:
              'linear-gradient(180deg, var(--color-gold-lit), var(--color-gold) 60%, transparent)',
          }}
          aria-hidden="true"
        />

        <ol className="flex flex-col gap-14 sm:gap-20">
          {wedding.story.map((chapter, i) => (
            <li key={`${chapter.when}-${i}`} className="relative">
              {/* Düğüm noktası */}
              <span
                className="absolute top-1.5 left-[-1.4375rem] block h-2.5 w-2.5 rounded-full sm:left-1/2 sm:-translate-x-1/2"
                style={{
                  background: 'var(--color-gold)',
                  boxShadow: '0 0 0 4px rgba(201,162,39,0.14), 0 0 16px rgba(201,162,39,0.5)',
                }}
                aria-hidden="true"
              />

              <Reveal delay={0.05}>
                <div
                  className={`flex flex-col gap-3 sm:w-[calc(50%-2.5rem)] ${
                    i % 2 === 0 ? 'sm:items-end sm:text-right' : 'sm:ml-auto'
                  }`}
                >
                  <span className="eyebrow">{chapter.when}</span>
                  <h3 className="text-ink font-display text-[1.5rem] leading-tight sm:text-[1.75rem]">
                    {chapter.title}
                  </h3>
                  <p className="text-ink-dim max-w-[32rem] text-[0.9375rem] leading-relaxed">
                    {chapter.body}
                  </p>

                  {chapter.photo && (
                    <Photo
                      src={chapter.photo}
                      alt={chapter.alt ?? ''}
                      className="mt-2 aspect-[4/3] w-full max-w-[22rem] rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-gold)_22%,transparent)] object-cover shadow-[var(--shadow-card)]"
                    />
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  )
}
