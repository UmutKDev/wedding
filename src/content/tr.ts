/* ════════════════════════════════════════════════════════════════════════
 *  ARAYÜZ METİNLERİ
 *  Sitede görünen bütün sabit metinler burada. Kişiye/etkinliğe özel
 *  veriler (isim, tarih, adres, anılar…) için → config/wedding.ts
 * ════════════════════════════════════════════════════════════════════════ */

export const tr = {
  // ── Yükleme & açılış ────────────────────────────────────────────────
  loading: {
    preparing: 'Hazırlanıyor',
  },
  envelope: {
    eyebrow: 'Davetiyeniz hazır',
    open: 'Davetiyeyi Aç',
    hint: 'Ses açık olacak',
  },
  intro: {
    skip: 'Atla',
    replay: 'Açılışı tekrar izle',
  },

  // ── Hero ────────────────────────────────────────────────────────────
  hero: {
    eyebrow: 'Evleniyoruz',
    and: '&',
    scroll: 'Kaydırın',
  },

  // ── Geri sayım ──────────────────────────────────────────────────────
  countdown: {
    eyebrow: 'Büyük güne',
    days: 'Gün',
    hours: 'Saat',
    minutes: 'Dakika',
    seconds: 'Saniye',
    /** Tarih geçtikten sonra */
    marriedTitle: 'Evlendik',
    marriedSince: 'Birlikte geçen gün',
    today: 'Bugün o gün',
  },

  // ── Detaylar / takvim ───────────────────────────────────────────────
  details: {
    eyebrow: 'Ne zaman, nerede',
    title: 'Düğünümüz',
    addToCalendar: 'Takvime Ekle',
    addToCalendarApple: 'Takvim dosyası (.ics)',
    addToCalendarGoogle: 'Google Takvim',
    calendarAdded: 'Takvime eklendi',
  },

  // ── Mekân ───────────────────────────────────────────────────────────
  venue: {
    directions: 'Yol Tarifi',
    // Kısa tutuluyor: üstteki "Yol Tarifi" başlığı bağlamı zaten veriyor
    // ve üç düğme telefonda tek satıra sığıyor.
    google: 'Google',
    apple: 'Apple',
    yandex: 'Yandex',
    copyAddress: 'Adresi kopyala',
    copied: 'Kopyalandı',
    mapLabel: 'harita üzerindeki konumu',
  },

  storyFilm: {
    eyebrow: 'Kısa film',
    title: 'Bizden Bir Parça',
    play: 'Oynat',
    pause: 'Duraklat',
    mute: 'Sesi kapat',
    unmute: 'Sesi aç',
    fullscreen: 'Tam ekran',
    exitFullscreen: 'Tam ekrandan çık',
    unavailable: 'Video yakında burada olacak',
  },
  reel: {
    eyebrow: 'Bir bakışta',
    title: 'Anlarımız',
  },

  // ── Galeri ──────────────────────────────────────────────────────────
  gallery: {
    eyebrow: 'Anılar',
    title: 'Bizden Kareler',
    close: 'Kapat',
    prev: 'Önceki fotoğraf',
    next: 'Sonraki fotoğraf',
    counter: (i: number, total: number) => `${i} / ${total}`,
  },

  // ── Kapanış ─────────────────────────────────────────────────────────
  closing: {
    line1: 'Bu güzel günde',
    line2: 'sizleri de aramızda görmek isteriz',
    share: 'Davetiyeyi Paylaş',
    shareTitle: 'Ömer & Burcu — Evleniyoruz',
    shareText: 'Düğünümüze davetlisiniz 🤍',
    linkCopied: 'Bağlantı kopyalandı',
    contact: 'İletişim',
  },

  // ── Ses ─────────────────────────────────────────────────────────────
  audio: {
    on: 'Müziği kapat',
    off: 'Müziği aç',
  },

  // ── Hata / fallback ─────────────────────────────────────────────────
  fallback: {
    webglTitle: 'Ömer & Burcu',
    webglText:
      'Cihazınız 3B görüntülemeyi desteklemiyor, ancak davetiyenin tamamını aşağıda görebilirsiniz.',
  },
} as const

export type Copy = typeof tr
