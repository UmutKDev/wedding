/* ════════════════════════════════════════════════════════════════════════
 *  DAVETİYENİN TEK GERÇEK KAYNAĞI
 *  ─────────────────────────────────────────────────────────────────────
 *  Sitedeki bütün tarih, saat, isim, adres ve içerik buradan gelir.
 *  Bilgi değiştiğinde SADECE bu dosyaya dokunulur.
 *
 *  ⚠️  "TODO" işaretli satırlar örnek/placeholder veridir — gerçeğiyle
 *      değiştirin. Diğer alanlar isteğe bağlıdır.
 *
 *  📅  Tarih formatı: ISO 8601 + saat dilimi.  Türkiye = +03:00 (sabit).
 *      Örnek: '2026-09-12T19:00:00+03:00'  →  12 Eylül 2026, 19:00
 * ════════════════════════════════════════════════════════════════════════ */

export interface Venue {
  /** Mekânın görünen adı */
  name: string
  /** Sokak/cadde satırı */
  address: string
  /** İlçe */
  district: string
  /** Şehir */
  city: string
  /** Haritada gösterilecek koordinat */
  lat: number
  lng: number
  /** Misafirlere kısa yön tarifi notu (opsiyonel) */
  note?: string
}

export interface WeddingEvent {
  id: string
  /** "Nikah Töreni", "Düğün" gibi */
  label: string
  /** ISO 8601 + saat dilimi */
  startsAt: string
  /** Bitiş — takvim dosyası (.ics) için. Boşsa +4 saat varsayılır. */
  endsAt?: string
  /** Kendi mekânı varsa; yoksa ana mekân kullanılır. */
  venue?: Venue
  description?: string
}

export interface ProgramStep {
  /** Saat, "HH:mm" */
  time: string
  title: string
  description?: string
  /** Zaman çizelgesinde gösterilecek ikon anahtarı */
  icon?: 'rings' | 'glass' | 'plate' | 'dance' | 'music' | 'camera' | 'heart' | 'cake'
}

export interface StoryChapter {
  /** "2019", "Haziran 2023" gibi serbest metin */
  when: string
  title: string
  body: string
  /** /public/photos/story/ altındaki dosya yolu — yoksa boş bırakın */
  photo?: string
  alt?: string
}

export interface GalleryItem {
  /** /public/photos/gallery/ altındaki dosya yolu */
  src: string
  alt: string
  /** Işıklı görünümde (lightbox) gösterilecek açıklama */
  caption?: string
}

export interface Person {
  first: string
  last: string
  /** Davetiyede anılacaksa anne-baba adı */
  parents?: string
}

export interface Contact {
  label: string
  tel: string
}

/**
 * Davetiyenin tam sözleşmesi.
 *
 * Config açıkça tiplenir (`as const` ile değil): `as const` boş bir diziyi
 * `readonly never[]`'e daraltır ve içine öğe eklendiğinde derleyici hata
 * verir. Arayüz ise hem boş başlamayı hem sonradan doldurmayı sorunsuz
 * kılar, üstelik düzenlerken alan adlarını otomatik tamamlar.
 */
export interface WeddingConfig {
  couple: {
    groom: Person
    bride: Person
    order: readonly ['groom' | 'bride', 'groom' | 'bride']
  }
  /** Geri sayımın hedeflediği an — ISO 8601 + saat dilimi */
  countdownTarget: string
  venue: Venue
  events: WeddingEvent[]
  program: ProgramStep[]
  story: StoryChapter[]
  gallery: GalleryItem[]
  contact: Contact[]
  /** Paylaşım bağlantısı — deploy sonrası gerçek adres */
  siteUrl: string
}

// ─────────────────────────────────────────────────────────────────────────
//  MEKÂN
// ─────────────────────────────────────────────────────────────────────────
const mainVenue: Venue = {
  name: 'Kavaklık Şato Restaurant',
  address: 'Sarıgüllük Mah., 100. Yıl Parkı içi, Masal Parkı yanı',
  district: 'Şehitkamil',
  city: 'Gaziantep',
  // Google Maps paylaşım linkinden çözülen tam koordinat.
  lat: 37.0630779,
  lng: 37.356708,
  note: 'Mekân 100. Yıl Parkı’nın içinde, Masal Parkı’nın yanındadır.',
}

// ─────────────────────────────────────────────────────────────────────────
//  DAVETİYE
// ─────────────────────────────────────────────────────────────────────────
export const wedding: WeddingConfig = {
  /** Çift */
  couple: {
    groom: {
      first: 'Ömer',
      last: 'Çevikbaş',
      /** Davetiyede anılacaksa anne-baba adı, yoksa boş bırakın */
      parents: '',
    },
    bride: {
      first: 'Burcu',
      last: 'Bozgeyik',
      parents: '',
    },
    /** Hero'da isimlerin sırası */
    order: ['groom', 'bride'],
  },

  /**
   * GERİ SAYIMIN hedeflediği an ve sayfa başlıklarında görünen ana tarih.
   * Genelde düğün/nikah başlangıcıdır.
   */
  countdownTarget: '2026-09-20T19:00:00+03:00', // TODO: saat

  /** Ana mekân */
  venue: mainVenue,

  /**
   * Etkinlikler. Her biri "Takvime Ekle" butonuyla ayrı ayrı eklenebilir.
   * Kendi mekânı olmayan etkinlik ana mekânı kullanır.
   */
  events: [
    {
      id: 'nikah',
      label: 'Nikah Töreni',
      startsAt: '2026-09-20T19:00:00+03:00', // TODO: saat
      endsAt: '2026-09-20T19:45:00+03:00', // TODO: saat
      description: 'Nikah törenimizde yanımızda olmanızı çok isteriz.',
    },
    {
      id: 'dugun',
      label: 'Düğün',
      startsAt: '2026-09-20T20:00:00+03:00', // TODO: saat
      endsAt: '2026-09-21T00:30:00+03:00', // TODO: saat
      description: 'Yemek, müzik ve dans — sabaha kadar.',
    },
    {
      id: 'kina',
      label: 'Kına',
      // Düğünle AYNI VAKİTTE — ayrı bir gün veya seans değil.
      startsAt: '2026-09-20T20:00:00+03:00', // TODO: saat
      endsAt: '2026-09-21T00:30:00+03:00', // TODO: saat
      description: 'Kınamız düğünle birlikte, aynı gecede.',
      // Farklı bir mekânda olsaydı `venue: { … }` eklemek yeterliydi;
      // kart o zaman kendi adresini de gösterirdi.
    },
  ],

  /** Gecenin akışı */
  program: [
    { time: '18:30', title: 'Karşılama', description: 'Misafir kabulü ve ikramlar', icon: 'glass' },
    { time: '19:00', title: 'Nikah Töreni', description: 'Tören salonunda', icon: 'rings' },
    { time: '19:45', title: 'Kokteyl', description: 'Fotoğraf ve tebrikler', icon: 'camera' },
    { time: '20:30', title: 'Yemek', description: 'Akşam yemeği servisi', icon: 'plate' },
    { time: '21:30', title: 'İlk Dans', icon: 'dance' },
    { time: '22:00', title: 'Pasta', icon: 'cake' },
    { time: '22:15', title: 'Parti', description: 'Canlı müzik ve DJ', icon: 'music' },
  ],

  /**
   * Hikâye zaman tüneli. Boş dizi bırakılırsa bölüm gizlenir.
   * Fotoğrafları /public/photos/story/ içine koyun.
   */
  story: [
    {
      when: '2019',
      title: 'Tanıştık',
      body: 'Ortak bir arkadaş buluşmasında karşılaştık. O akşam konuşmaya başladık ve bir daha hiç susmadık.',
      photo: '', // TODO: '/photos/story/01-tanisma.webp'
      alt: 'Ömer ve Burcu ilk kez birlikte',
    },
    {
      when: '2021',
      title: 'İlk Yolculuğumuz',
      body: 'Küçük bir hafta sonu kaçamağı diye çıktık; geri döndüğümüzde artık bir "biz" vardı.',
      photo: '', // TODO
      alt: 'İlk yolculuk',
    },
    {
      when: '2024',
      title: 'Evlenme Teklifi',
      body: 'Gün batarken, ikimizin de en sevdiği yerde, tek bir soruyla her şey yerine oturdu.',
      photo: '', // TODO
      alt: 'Evlenme teklifi anı',
    },
    {
      when: '2026',
      title: 'Evleniyoruz',
      body: 'Ve şimdi, en sevdiklerimizin yanında hayatımızın en güzel gününü yaşamaya hazırlanıyoruz.',
      photo: '', // TODO
      alt: 'Düğün hazırlığı',
    },
  ],

  /**
   * ANILAR bölümü. Boş dizi bırakılırsa bölüm gizlenir.
   *
   * 3 veya daha az fotoğrafta ortalanmış ızgara, daha fazlasında yatay
   * kaydırmalı şerit olarak gösterilir. Her ikisinde de fotoğrafa
   * dokununca tam ekran görüntüleyici açılır.
   *
   * ⚠️ Fotoğrafları `public/photos/memories/` içine koyun. Dosya yoksa
   * kırık görsel ikonu değil, zarif bir yer tutucu görünür.
   */
  gallery: [
    {
      src: '/photos/memories/01.jpg',
      alt: 'Ömer ve Burcu nişan pastalarını keserken',
      caption: 'Nişanımız',
    },
    {
      src: '/photos/memories/02.jpg',
      alt: 'Ömer ve Burcu birbirlerine pasta yedirirken',
      caption: 'Nişanımız',
    },
  ],

  /** İletişim — boş dizi bırakılırsa gösterilmez */
  contact: [
    // TODO — örnek:
    // { label: 'Ömer', tel: '+905000000000' },
    // { label: 'Burcu', tel: '+905000000000' },
  ],

  /** Paylaşım bağlantısı — deploy sonrası gerçek adresle değiştirin */
  siteUrl: 'https://omer-burcu.vercel.app', // TODO
}

export type Wedding = typeof wedding
