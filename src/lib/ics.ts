/**
 * Takvim entegrasyonu — sunucu gerektirmez.
 *
 * `.ics` dosyası tarayıcıda Blob olarak üretilir; iOS ve Android'de
 * dosya doğrudan takvim uygulamasında açılır.
 * Google Takvim için ayrıca hazır bir bağlantı üretilir.
 */

export interface CalendarEvent {
  title: string
  /** ISO 8601 + saat dilimi */
  startsAt: string
  /** Boşsa başlangıç + 4 saat */
  endsAt?: string
  location?: string
  description?: string
  url?: string
}

/** Date → '20260912T160000Z' (UTC) */
const toUtcStamp = (d: Date): string => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

const resolveEnd = (e: CalendarEvent): Date => {
  if (e.endsAt) return new Date(e.endsAt)
  const end = new Date(e.startsAt)
  end.setHours(end.getHours() + 4)
  return end
}

/** RFC 5545: ters bölü, noktalı virgül, virgül ve satır sonu kaçışlanır. */
const escapeText = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** RFC 5545: satırlar 75 oktet'te katlanır (devam satırı boşlukla başlar). */
const foldLine = (line: string): string => {
  if (line.length <= 75) return line
  const chunks: string[] = [line.slice(0, 75)]
  for (let i = 75; i < line.length; i += 74) chunks.push(' ' + line.slice(i, i + 74))
  return chunks.join('\r\n')
}

/** Deterministik UID — aynı etkinlik için hep aynı, takvimde çift kayıt olmaz. */
const uidFor = (e: CalendarEvent): string => {
  let hash = 0
  const seed = `${e.title}|${e.startsAt}|${e.location ?? ''}`
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return `${(hash >>> 0).toString(36)}@davetiye`
}

export const buildIcs = (e: CalendarEvent): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dugun Davetiyesi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uidFor(e)}`,
    // DTSTAMP oluşturma anıdır; sabit tutmak yerine gerçek an kullanılır.
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(new Date(e.startsAt))}`,
    `DTEND:${toUtcStamp(resolveEnd(e))}`,
    `SUMMARY:${escapeText(e.title)}`,
    e.location ? `LOCATION:${escapeText(e.location)}` : '',
    e.description ? `DESCRIPTION:${escapeText(e.description)}` : '',
    e.url ? `URL:${e.url}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Yarın düğün!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  return lines.map(foldLine).join('\r\n')
}

/** .ics dosyasını indirir. iOS/Android'de takvim uygulaması açılır. */
export const downloadIcs = (e: CalendarEvent, filename = 'davetiye.ics'): void => {
  const blob = new Blob([buildIcs(e)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Safari indirmeyi başlatmadan iptal etmemek için gecikmeli serbest bırak.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Google Takvim'de "etkinlik ekle" ekranını açan bağlantı. */
export const googleCalendarUrl = (e: CalendarEvent): string => {
  const stamp = (d: Date) => toUtcStamp(d).replace(/Z$/, 'Z')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${stamp(new Date(e.startsAt))}/${stamp(resolveEnd(e))}`,
  })
  if (e.location) params.set('location', e.location)
  if (e.description) params.set('details', e.description)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
