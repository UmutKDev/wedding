/** Türkçe tarih/saat biçimlendirme. Tüm çıktı `tr-TR` yereline göre. */

const TZ = 'Europe/Istanbul'

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, ...opts })

/** '12 Eylül 2026 Cumartesi' */
export const formatFullDate = (iso: string): string =>
  fmt({ day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).format(new Date(iso))

/** '12 Eylül 2026' */
export const formatDate = (iso: string): string =>
  fmt({ day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

/** '19:00' */
export const formatTime = (iso: string): string =>
  fmt({ hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

/** Tarih kartı için parçalara ayrılmış hâli */
export interface DateParts {
  /** '12' */
  day: string
  /** 'Eylül' */
  month: string
  /** '2026' */
  year: string
  /** 'Cumartesi' */
  weekday: string
  /** '19:00' */
  time: string
}

export const dateParts = (iso: string): DateParts => {
  const d = new Date(iso)
  return {
    day: fmt({ day: 'numeric' }).format(d),
    month: fmt({ month: 'long' }).format(d),
    year: fmt({ year: 'numeric' }).format(d),
    weekday: fmt({ weekday: 'long' }).format(d),
    time: formatTime(iso),
  }
}

/** Sayıyı iki haneye tamamlar: 7 → '07' */
export const pad2 = (n: number): string => String(Math.max(0, n)).padStart(2, '0')
