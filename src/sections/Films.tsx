import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { VideoPlayer } from '../components/VideoPlayer'
import { media } from '../config/media'
import { tr } from '../content/tr'

/**
 * "Hikâyemiz" filmi — yatay, altın çerçeveli.
 * Video dosyası yoksa bölüm hiç render edilmez.
 */
export function StoryFilm() {
  if (!media.story.enabled) return null

  return (
    <SectionShell
      id="film"
      eyebrow={tr.storyFilm.eyebrow}
      title={tr.storyFilm.title}
      width="wide"
    >
      <Reveal>
        <div
          className="relative rounded-[var(--radius-card)] p-[1px]"
          style={{
            background:
              'linear-gradient(140deg, color-mix(in oklab, var(--color-gold) 55%, transparent), transparent 45%, color-mix(in oklab, var(--color-gold) 28%, transparent))',
          }}
        >
          <VideoPlayer slot={media.story} />
        </div>
      </Reveal>
    </SectionShell>
  )
}

/**
 * Dikey reel bölümü.
 *
 * 📱 Telefonda video ekranın neredeyse tamamını kaplar — 9:16 zaten
 * cihazın kendi oranı. Masaüstünde ise ortada dar bir sütuna oturur ve
 * arkasında aynı karenin bulanık, büyütülmüş kopyası durur; yanlarda
 * boş siyah şeritler kalmaz.
 */
export function Reel() {
  if (!media.reel.enabled) return null

  return (
    <SectionShell id="reel" eyebrow={tr.reel.eyebrow} title={tr.reel.title} width="wide">
      <Reveal>
        <div className="mx-auto w-full max-w-[24rem]">
          <VideoPlayer slot={media.reel} forcePortrait />
        </div>
      </Reveal>
    </SectionShell>
  )
}
