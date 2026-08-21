import { CopyButton } from '../components/CopyButton'
import { GoldButton } from '../components/GoldButton'
import { Reveal } from '../components/Reveal'
import { wedding } from '../config/wedding'
import { tr } from '../content/tr'
import {
  appleMapsUrl,
  fullAddress,
  googleEmbedUrl,
  googleMapsUrl,
  yandexMapsUrl,
  type MapTarget,
} from '../lib/maps'

interface VenueCardProps {
  /** Farklı bir mekân için de kullanılabilir */
  venue?: MapTarget & { note?: string }
}

/**
 * Mekân kartı: gömülü harita, adres, kopyalama ve yol tarifi bağlantıları.
 *
 * Kendi bölümü YOK — "Ne zaman, nerede" bölümünün içinde, düğün kartının
 * hemen altında duruyor. Bölüm başlığı zaten "ne zaman VE NEREDE" diyor;
 * mekânı ayrı bir başlık altına almak aynı soruyu ikiye bölüyordu.
 */
export function VenueCard({ venue = wedding.venue }: VenueCardProps) {
  const address = fullAddress(venue)

  return (
    <Reveal>
        <div className="surface overflow-hidden">
          {/*
            Gömülü Google haritası.

            `loading="lazy"`: iframe ancak görüş alanına yaklaşınca istek
            atar. Harita sayfanın epey aşağısında olduğu için, açılışta
            üçüncü tarafa istek gitmiyor ve mobil veriden yüz kilobaytlar
            harcanmıyor — ama misafirin ayrıca bir düğmeye dokunması da
            gerekmiyor, kaydırınca harita orada.
          */}
          <div className="relative aspect-[4/3] w-full bg-[color-mix(in_oklab,var(--color-gold)_5%,var(--color-card))] sm:aspect-[16/9]">
            <iframe
              src={googleEmbedUrl(venue)}
              title={`${venue.name} — ${tr.venue.mapLabel}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              style={{
                /*
                 * Çok hafif bir sıcaklık — haritayı fildişi palete yaklaştırır.
                 * Koyu temada burada `invert(0.92) hue-rotate(185deg)` vardı;
                 * Google'ın açık haritasını karartmak içindi. Açık temada o
                 * filtre haritayı ters çevirip sayfanın ortasında kara bir
                 * dikdörtgen bırakırdı.
                 */
                filter: 'saturate(0.88) sepia(0.06) brightness(1.01)',
              }}
            />
          </div>

          {/* Adres ve eylemler */}
          <div className="flex flex-col items-center gap-5 px-5 py-8 text-center sm:px-8">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-gold-plain font-display text-[1.375rem] tracking-[0.06em]">
                {venue.name}
              </h3>
              <p className="text-ink-dim text-[0.9375rem] leading-relaxed">
                {venue.address}
                <br />
                {venue.district}, {venue.city}
              </p>
            </div>

            <CopyButton
              value={address}
              label={tr.venue.copyAddress}
              copiedLabel={tr.venue.copied}
            />

            {venue.note && (
              <p className="text-ink-faint max-w-[26rem] text-[0.8125rem] leading-relaxed">
                {venue.note}
              </p>
            )}

            <span className="rule-gold w-16" />

            <div className="flex flex-col items-center gap-3">
              <span className="text-ink-faint text-[0.625rem] tracking-[0.26em] uppercase">
                {tr.venue.directions}
              </span>
              {/* Sabit 3 sütun — `flex-wrap` telefonda 2+1 diye kırıyordu */}
              <div className="grid w-full max-w-[21rem] grid-cols-3 gap-2">
                <GoldButton as="a" size="compact" href={googleMapsUrl(venue)} external>
                  {tr.venue.google}
                </GoldButton>
                <GoldButton as="a" size="compact" href={appleMapsUrl(venue)} external>
                  {tr.venue.apple}
                </GoldButton>
                <GoldButton as="a" size="compact" href={yandexMapsUrl(venue)} external>
                  {tr.venue.yandex}
                </GoldButton>
              </div>
            </div>
          </div>
      </div>
    </Reveal>
  )
}
