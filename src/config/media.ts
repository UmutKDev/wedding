/* ════════════════════════════════════════════════════════════════════════
 *  MEDYA SLOTLARI  —  video, poster ve müzik
 *  ─────────────────────────────────────────────────────────────────────
 *  Burada AYAR YAPMANIZA GEREK YOK. Dosyayı doğru isimle
 *  `src/media/` klasörüne bırakmanız yeterli — build sırasında otomatik
 *  bulunur ve ilgili bölüm kendiliğinden açılır.
 *
 *  Dosya yoksa: bölüm sessizce gizlenir veya poster/gradyan fallback'e
 *  düşer. Site hiçbir zaman hata vermez.
 *
 *  📱 MOBİL ÖNCELİKLİ
 *  Davetiye ağırlıkla telefondan açılacağı için her yatay (16:9) videonun
 *  isteğe bağlı bir DİKEY varyantı olabilir: `<ad>-portrait.mp4`
 *  Varsa telefonda o oynatılır; yoksa 16:9 merkez-güvenli kırpılır.
 *
 *  Beklenen dosya adları (detay için ASSETS.md):
 *    intro.mp4          intro.webm          intro.jpg           16:9  açılış filmi
 *    intro-portrait.*                                            9:16  (opsiyonel)
 *    hero-loop.mp4      hero-loop.webm      hero-loop.jpg       16:9  hero arka planı
 *    hero-loop-portrait.*                                        9:16  (opsiyonel, ÖNERİLİR)
 *    story.mp4          story.webm          story.jpg           16:9  hikâye filmi
 *    reel.mp4           reel.webm           reel.jpg             9:16  dikey reel
 *    ambient.mp3                                                       arka plan müziği
 *
 *  .webm isteğe bağlıdır (varsa önce o denenir, daha küçüktür).
 *  Poster (.jpg) isteğe bağlıdır ama şiddetle önerilir — mobil bağlantıda
 *  video yüklenene kadar ekranda boşluk kalmaz.
 * ════════════════════════════════════════════════════════════════════════ */

/** src/media/ içindeki her şeyi build zamanında tara. Klasör boşsa: {} */
const files = import.meta.glob('../media/*.{mp4,webm,mov,jpg,jpeg,png,webp,mp3,m4a,ogg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** '../media/hero-loop.webm' → 'hero-loop.webm' */
const byName = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  byName.set(path.slice(path.lastIndexOf('/') + 1).toLowerCase(), url)
}

const find = (...names: string[]): string | undefined => {
  for (const n of names) {
    const hit = byName.get(n.toLowerCase())
    if (hit) return hit
  }
  return undefined
}

/** Tek bir oynatılabilir kaynak (bir yön için) */
export interface VideoVariant {
  readonly available: boolean
  readonly webm?: string
  readonly mp4?: string
  readonly poster?: string
  /** CSS aspect-ratio değeri, ör. '16 / 9' */
  readonly aspect: string
}

export interface VideoSlot {
  /** En az bir varyant bulunduysa true — bölümler bunu kontrol eder */
  readonly enabled: boolean
  /** Ana (genelde yatay) varyant */
  readonly wide: VideoVariant
  /** Telefon için dikey varyant — dosya yoksa `available: false` */
  readonly portrait: VideoVariant
}

const variant = (base: string, aspect: string): VideoVariant => {
  const webm = find(`${base}.webm`)
  const mp4 = find(`${base}.mp4`, `${base}.mov`)
  return {
    available: Boolean(webm || mp4),
    webm,
    mp4,
    poster: find(`${base}.jpg`, `${base}.jpeg`, `${base}.png`, `${base}.webp`),
    aspect,
  }
}

const slot = (base: string, wideAspect: string, portraitAspect = '9 / 16'): VideoSlot => {
  const wide = variant(base, wideAspect)
  const portrait = variant(`${base}-portrait`, portraitAspect)
  return { enabled: wide.available || portrait.available, wide, portrait }
}

export const media = {
  /** Zarf açıldığında tam ekran oynayan açılış filmi (sesli) */
  intro: slot('intro', '16 / 9'),
  /** Hero arka planında sessiz, sonsuz dönen doku */
  heroLoop: slot('hero-loop', '16 / 9'),
  /** "Hikâyemiz" bölümündeki uzun film (sesli) */
  story: slot('story', '16 / 9'),
  /** Dikey reel bölümü (sesli) — zaten 9:16, ayrı varyanta gerek yok */
  reel: slot('reel', '9 / 16', '9 / 16'),
  /** Arka plan müziği */
  audio: find('ambient.mp3', 'ambient.m4a', 'ambient.ogg'),
} as const

/**
 * Ekrana göre doğru varyantı seç.
 * Dikey varyant yoksa yatayına düşer (ve merkez-güvenli kırpılır).
 */
export const pickVariant = (s: VideoSlot, preferPortrait: boolean): VideoVariant => {
  if (preferPortrait && s.portrait.available) return s.portrait
  if (s.wide.available) return s.wide
  return s.portrait
}

/** Geliştirme sırasında hangi medyanın eksik olduğunu konsola yaz. */
if (import.meta.env.DEV) {
  const missing = [
    !media.intro.enabled && 'intro.mp4 — açılış filmi',
    !media.heroLoop.enabled && 'hero-loop.mp4 — hero arka planı',
    !media.heroLoop.portrait.available &&
      'hero-loop-portrait.mp4 — hero dikey varyantı (mobil için önerilir)',
    !media.story.enabled && 'story.mp4 — hikâye filmi',
    !media.reel.enabled && 'reel.mp4 — dikey reel',
    !media.audio && 'ambient.mp3 — arka plan müziği',
  ].filter(Boolean)

  if (missing.length) {
    console.info(
      `%c🎬 Eksik medya — fallback gösteriliyor%c\n   ${missing.join('\n   ')}\n\n   Dosyaları src/media/ içine bırakın. Nasıl üretilir: VIDEO-PROMPTS.md`,
      'color:#B8912F;font-weight:600',
      'color:#6E655E',
    )
  }
}
