import { GoldButton } from './GoldButton'
import { tr } from '../content/tr'
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from '../lib/ics'

interface AddToCalendarProps {
  event: CalendarEvent
  filename?: string
  className?: string
}

const CalendarIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 6.5h13M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

/**
 * Takvime ekleme — sunucu gerektirmez.
 *
 * İki yol birden sunulur çünkü platformlar farklı davranır:
 *  • `.ics` dosyası iOS'ta doğrudan Takvim uygulamasında açılır; masaüstü
 *    Outlook/Apple Takvim de bunu bekler.
 *  • Android'de varsayılan takvim genelde Google Takvim'dir ve hazır
 *    bağlantı tek dokunuşta etkinlik ekleme ekranını açar.
 */
export function AddToCalendar({ event, filename, className = '' }: AddToCalendarProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <GoldButton
        variant="solid"
        icon={CalendarIcon}
        onClick={() => downloadIcs(event, filename)}
      >
        {tr.details.addToCalendar}
      </GoldButton>

      <GoldButton as="a" href={googleCalendarUrl(event)} external>
        {tr.details.addToCalendarGoogle}
      </GoldButton>
    </div>
  )
}
