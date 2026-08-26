import { AddToCalendar } from '../components/AddToCalendar'
import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { VenueCard } from './Venue'
import { coupleOrder, wedding } from '../config/wedding'
import { tr } from '../content/tr'
import { dateParts, formatTime } from '../lib/format'
import { fullAddress } from '../lib/maps'
import type { CalendarEvent } from '../lib/ics'

/**
 * Tarih, saat ve program kartları + takvime ekleme.
 *
 * 📱 Kartlar telefonda alt alta, tabletten itibaren yan yana. Tarihin
 * kendisi tek bir büyük rakam olarak öne çıkar — misafirin ekrana bakıp
 * bir saniyede aklında tutması gereken bilgi budur.
 */
export function Details() {
  const d = dateParts(wedding.countdownTarget)
  const address = fullAddress(wedding.venue)

  /*
   * Tüm günü kapsayan tek takvim kaydı. Misafir tek kayıtla bütün günü görür.
   *
   * Sınırlar dizi SIRASINDAN değil, gerçek zaman damgalarından hesaplanıyor.
   * "İlk öğe en erken, son öğe en geç" varsayımı kırılgan: kına aynı vakte
   * alınıp listenin sonuna eklendiğinde son öğe artık en geç biten etkinlik
   * olmayabiliyor ve takvim kaydı düğünün ortasında bitiyordu.
   */
  const times = wedding.events.flatMap((e) => [
    new Date(e.startsAt).getTime(),
    new Date(e.endsAt ?? e.startsAt).getTime(),
  ])

  const wholeDay: CalendarEvent = {
    title: `${coupleOrder[0].first} & ${coupleOrder[1].first} — Düğün`,
    startsAt: new Date(Math.min(...times)).toISOString(),
    endsAt: new Date(Math.max(...times)).toISOString(),
    location: address,
    description: `${coupleOrder[0].first} ve ${coupleOrder[1].first}'ın düğününe davetlisiniz.`,
    url: wedding.siteUrl,
  }

  return (
    <SectionShell id="detaylar" eyebrow={tr.details.eyebrow} title={tr.details.title} width="wide">
      {/* Tarih — büyük ve tek bakışta okunur */}
      <Reveal>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-ink-dim text-eyebrow tracking-[0.3em] uppercase">
            {d.weekday}
          </span>
          <span className="text-foil font-display text-[clamp(4rem,22vw,8rem)] leading-[0.9]">
            {d.day}
          </span>
          <span className="text-ink font-display text-lead tracking-[0.28em] uppercase">
            {d.month} {d.year}
          </span>
        </div>
      </Reveal>

      {/*
        Etkinlik kartları. Sütun düzeni sayıya göre: tek etkinlikte
        ortalanmış dar bir kart (yarım genişlikte asılı kalmasın), ikide
        2 sütun, üç ve üzerinde 3.
      */}
      <div
        className={`mt-12 grid gap-4 ${
          wedding.events.length === 1
            ? 'mx-auto max-w-[24rem]'
            : wedding.events.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-3'
        }`}
      >
        {wedding.events.map((event, i) => (
          <Reveal key={event.id} delay={i * 0.1}>
            <article className="surface flex h-full flex-col items-center gap-3 px-5 py-8 text-center sm:px-6">
              <h3 className="text-gold-plain font-display text-[1.5rem] tracking-[0.08em]">
                {event.label}
              </h3>
              <span className="rule-gold w-10" />
              <time
                className="text-ink font-display text-[2rem] leading-none tabular-nums"
                dateTime={event.startsAt}
              >
                {formatTime(event.startsAt)}
              </time>
              {event.description && (
                <p className="text-ink-dim text-[0.9375rem] leading-relaxed">
                  {event.description}
                </p>
              )}
              {/*
                Yalnızca kendi mekânı olan etkinlikte görünür. Bu alan
                config'de tanımlı olduğu için hiç render edilmemesi
                sessiz bir tuzak olurdu: doldurulup hiçbir şey olmayan
                bir ayar.
              */}
              {event.venue && (
                <p className="text-ink-faint mt-1 text-[0.8125rem] leading-relaxed">
                  {event.venue.name}
                  <br />
                  {event.venue.district}, {event.venue.city}
                </p>
              )}
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <AddToCalendar event={wholeDay} filename="omer-burcu-dugun.ics" className="mt-10" />
      </Reveal>

      {/* "Nerede" — harita, adres ve navigasyon, düğün kartının hemen altında */}
      <div className="mt-12">
        <VenueCard />
      </div>
    </SectionShell>
  )
}
