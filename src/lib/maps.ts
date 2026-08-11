/**
 * Harita bağlantıları — API anahtarı gerektirmez.
 *
 * Mobilde bu bağlantılar yüklü harita uygulamasını açar:
 *   • iOS   → Apple Haritalar / Google Maps app
 *   • Android → Google Maps app
 *   • Yandex Navigasyon yüklüyse onu açar
 */

export interface MapTarget {
  name: string
  address: string
  district: string
  city: string
  lat: number
  lng: number
}

/** 'Mekân Adı, Cadde No, İlçe, İstanbul' */
export const fullAddress = (v: MapTarget): string =>
  [v.name, v.address, v.district, v.city].filter(Boolean).join(', ')

const coords = (v: MapTarget) => `${v.lat},${v.lng}`

/** Google Haritalar — yol tarifi ekranı */
export const googleMapsUrl = (v: MapTarget): string => {
  const p = new URLSearchParams({ api: '1', destination: coords(v) })
  return `https://www.google.com/maps/dir/?${p.toString()}`
}

/** Apple Haritalar — iOS'ta yerel uygulamayı açar */
export const appleMapsUrl = (v: MapTarget): string => {
  const p = new URLSearchParams({ daddr: coords(v), q: v.name, dirflg: 'd' })
  return `https://maps.apple.com/?${p.toString()}`
}

/**
 * Yandex Haritalar — Türkiye'de trafik verisi en iyi olan.
 *
 * URL elle kuruluyor: `rtext` parametresinde `~` işareti güzergâh
 * noktalarını ayırır. `URLSearchParams` onu `%7E` olarak kodluyor ve
 * Yandex'in ayrıştırıcısı çözmeden bölerse rota bozulur. Koordinatlarda
 * yalnızca rakam, nokta ve virgül olduğu için kodlamaya zaten gerek yok.
 */
export const yandexMapsUrl = (v: MapTarget): string =>
  `https://yandex.com.tr/harita/?rtext=~${coords(v)}&rtt=auto&z=16`

/**
 * Sayfaya gömülecek harita — anahtarsız Google embed.
 *
 * Sorgu `lat,lng(Etiket)` biçiminde: Google iğneyi tam koordinata koyar ve
 * yanına mekânın adını yazar. Yalnızca mekân adı arattırmak daha okunaklı
 * bir sonuç verirdi ama coğrafi çözümleme yanlış bir yere düşebilir —
 * koordinat kesin, etiket ise sadece görsel.
 */
export const googleEmbedUrl = (v: MapTarget): string => {
  const p = new URLSearchParams({
    q: `${coords(v)}(${v.name})`,
    z: '16',
    output: 'embed',
    hl: 'tr',
  })
  return `https://www.google.com/maps?${p.toString()}`
}

/** Panoya kopyalama — HTTPS yoksa eski yönteme düşer. */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* izin reddedildi veya güvenli bağlam değil — aşağıdaki yönteme düş */
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
