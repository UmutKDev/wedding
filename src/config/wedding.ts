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
  name: string;
  /** Sokak/cadde satırı */
  address: string;
  /** İlçe */
  district: string;
  /** Şehir */
  city: string;
  /** Haritada gösterilecek koordinat */
  lat: number;
  lng: number;
  /** Misafirlere kısa yön tarifi notu (opsiyonel) */
  note?: string;
}

export interface WeddingEvent {
  id: string;
  /** "Nikah Töreni", "Düğün" gibi */
  label: string;
  /** ISO 8601 + saat dilimi */
  startsAt: string;
  /** Bitiş — takvim dosyası (.ics) için. Boşsa +4 saat varsayılır. */
  endsAt?: string;
  /** Kendi mekânı varsa; yoksa ana mekân kullanılır. */
  venue?: Venue;
  description?: string;
}

export interface GalleryItem {
  /** /public/photos/memories/ altındaki dosya yolu */
  src: string;
  alt: string;
  /** Işıklı görünümde (lightbox) gösterilecek açıklama */
  caption?: string;
}

export interface Person {
  first: string;
  last: string;
  /** Davetiyede anılacaksa anne-baba adı */
  parents?: string;
}

export interface Contact {
  label: string;
  tel: string;
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
    groom: Person;
    bride: Person;
    order: readonly ["groom" | "bride", "groom" | "bride"];
  };
  /** Geri sayımın hedeflediği an — ISO 8601 + saat dilimi */
  countdownTarget: string;
  venue: Venue;
  events: WeddingEvent[];
  gallery: GalleryItem[];
  contact: Contact[];
  /** Paylaşım bağlantısı — deploy sonrası gerçek adres */
  siteUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────
//  MEKÂN
// ─────────────────────────────────────────────────────────────────────────
const mainVenue: Venue = {
  name: "Kavaklık Şato Restaurant",
  address: "Sarıgüllük Mah., 100. Yıl Parkı içi, Masal Parkı yanı",
  district: "Şehitkamil",
  city: "Gaziantep",
  // Google Maps paylaşım linkinden çözülen tam koordinat.
  lat: 37.0630779,
  lng: 37.356708,
  note: "Mekân 100. Yıl Parkı’nın içinde, Masal Parkı’nın yanındadır.",
};

// ─────────────────────────────────────────────────────────────────────────
//  DAVETİYE
// ─────────────────────────────────────────────────────────────────────────
export const wedding: WeddingConfig = {
  /** Çift */
  couple: {
    groom: {
      first: "Ömer",
      last: "Çevikbaş",
      /** Davetiyede anılacaksa anne-baba adı, yoksa boş bırakın */
      parents: "",
    },
    bride: {
      first: "Burcu",
      last: "Bozgeyik",
      parents: "",
    },
    /** Hero'da isimlerin sırası */
    order: ["groom", "bride"],
  },

  /**
   * GERİ SAYIMIN hedeflediği an ve sayfa başlıklarında görünen ana tarih.
   * Genelde düğün/nikah başlangıcıdır.
   */
  countdownTarget: "2026-09-20T19:00:00+03:00",

  /** Ana mekân */
  venue: mainVenue,

  /**
   * Etkinlikler — "Ne zaman, nerede" bölümünde kart olarak görünür.
   *
   * Şu an tek kart var (düğün). Nikah/kına gibi ayrı bir kart eklemek
   * isterseniz diziye bir nesne eklemeniz yeterli; ızgara sütun sayısını
   * kendisi ayarlar. Kendi mekânı olan etkinliğe `venue: { … }` eklerseniz
   * kart adresini de gösterir.
   */
  events: [
    {
      id: "dugun",
      label: "Düğün",
      startsAt: "2026-09-20T19:00:00+03:00",
      endsAt: "2026-09-21T00:30:00+03:00", // TODO: saat
      // Açıklama bilinçli olarak yok: kartta yalnızca saat duruyor.
    },
  ],

  /**
   * ANILAR bölümü — tek seferde bir fotoğraf gösteren slider.
   * Boş dizi bırakılırsa bölüm gizlenir. Kaç fotoğraf eklerseniz ekleyin
   * oklar ve noktalar kendini ayarlar; fotoğrafa dokununca tam ekran
   * görüntüleyici açılır.
   *
   * ⚠️ Fotoğrafları `public/photos/memories/` içine koyun. Dosya yoksa
   * kırık görsel ikonu değil, zarif bir yer tutucu görünür.
   */
  gallery: [
    {
      src: "/photos/memories/02.jpg",
      alt: "Ömer ve Burcu nişan pastalarının başında poz verirken",
      caption: "Nişanımız",
    },
  ],

  /** İletişim — boş dizi bırakılırsa gösterilmez */
  contact: [
    // TODO — örnek:
    // { label: 'Ömer', tel: '+905000000000' },
    // { label: 'Burcu', tel: '+905000000000' },
  ],

  /**
   * Sitenin gerçek adresi.
   *
   * Yalnızca paylaş düğmesi için değil: Open Graph mutlak URL istediği
   * için paylaşım kartının TAMAMI (başlık, açıklama, kapak görseli)
   * build sırasında buradan üretilir. Yanlışsa WhatsApp önizlemesi
   * sessizce boş çıkar.
   */
  siteUrl: "https://omer-burcu.vercel.app",
};

export type Wedding = typeof wedding;
