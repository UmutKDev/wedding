import { useEffect, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Hedefe kalan milisaniye (geçtiyse negatif) */
  remaining: number
  /** Tarih geçti mi? */
  isPast: boolean
  /** Tarih bugün mü? (aynı takvim günü) */
  isToday: boolean
  /** Tarih geçtiyse üzerinden kaç gün geçti */
  daysSince: number
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const compute = (targetMs: number, now: number): Countdown => {
  const remaining = targetMs - now
  const abs = Math.abs(remaining)

  const sameDay =
    new Date(targetMs).toDateString() === new Date(now).toDateString()

  return {
    days: Math.floor(abs / DAY),
    hours: Math.floor((abs % DAY) / HOUR),
    minutes: Math.floor((abs % HOUR) / MINUTE),
    seconds: Math.floor((abs % MINUTE) / SECOND),
    remaining,
    isPast: remaining <= 0,
    isToday: sameDay,
    daysSince: remaining <= 0 ? Math.floor(abs / DAY) : 0,
  }
}

/**
 * Saniyede bir güncellenen geri sayım.
 *
 * Mobil pil ömrü için iki önlem:
 *  • Zamanlayıcı sonraki saniye sınırına hizalanır (kayma birikmez).
 *  • Sekme arka plandayken sayaç durur, geri dönüldüğünde anında yenilenir.
 */
export function useCountdown(targetIso: string): Countdown {
  const targetMs = new Date(targetIso).getTime()
  const [value, setValue] = useState(() => compute(targetMs, Date.now()))

  useEffect(() => {
    if (Number.isNaN(targetMs)) return

    let timer: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      const now = Date.now()
      setValue(compute(targetMs, now))
      // Bir sonraki tam saniyeye hizala.
      timer = setTimeout(tick, SECOND - (now % SECOND))
    }

    const start = () => {
      stop()
      tick()
    }

    const stop = () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    }

    const onVisibility = () => (document.hidden ? stop() : start())

    start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [targetMs])

  return value
}
