import { useState } from 'react'

interface PhotoProps {
  src: string
  alt: string
  className?: string
  /** Ekran dışındaysa yüklemeyi ertele — galeri için varsayılan */
  loading?: 'lazy' | 'eager'
  /**
   * Dosya bulunamadığında bildirilir. Çağıran taraf buna göre fotoğrafın
   * üstüne bindirdiği açıklama, gölge gibi süsleri gizleyebilir — boş bir
   * kartın üstünde duran koyu bir açıklama şeridi bozuk görünüyor.
   */
  onFailed?: () => void
}

/**
 * Kırık görsel korumalı fotoğraf.
 *
 * Fotoğraflar `public/` altında durur, yani derleme sırasında varlıkları
 * doğrulanmaz — videolardaki gibi otomatik tespit yok, çünkü fotoğrafın
 * ayrıca alt metni ve açıklaması gerekiyor ve bunlar config'e yazılıyor.
 *
 * Dosya eksikse tarayıcı varsayılan olarak kırık görsel ikonu gösterir;
 * bir düğün davetiyesinin ortasında bundan kötü bir detay az bulunur.
 * Bu bileşen o durumu yakalayıp yerine sessiz, altın çerçeveli bir yer
 * tutucu koyar — böylece fotoğraflar eklenene kadar site kusursuz durur.
 */
export function Photo({ src, alt, className = '', loading = 'lazy', onFailed }: PhotoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[color-mix(in_oklab,var(--color-gold)_5%,var(--color-card))] ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg width="30" height="26" viewBox="0 0 30 26" fill="none" aria-hidden="true">
          <rect
            x="1"
            y="1"
            width="28"
            height="24"
            rx="3"
            stroke="var(--color-gold)"
            strokeWidth="1"
            opacity="0.45"
          />
          <circle cx="9.5" cy="9" r="2.6" stroke="var(--color-gold)" strokeWidth="1" opacity="0.45" />
          <path
            d="M2.5 20l7-7 5.5 5.5 4.5-4 8 7.5"
            stroke="var(--color-gold)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        setFailed(true)
        onFailed?.()
      }}
      className={className}
    />
  )
}
