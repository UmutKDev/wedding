import { useSyncExternalStore } from 'react'

/**
 * Bir CSS medya sorgusunu React durumuna bağlar.
 * `useSyncExternalStore` kullanır — StrictMode ve eşzamanlı render güvenli.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // sunucu/ilk render varsayılanı
  )
}

/** Ekran dikey mi? Dikey video varyantını seçmek için kullanılır. */
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)')

/** Telefon genişliği — düzen kararları için (mobil öncelikli eşik) */
export const useIsPhone = () => useMediaQuery('(max-width: 767px)')

/** Dokunmatik cihaz mı? Özel imleç ve hover efektleri burada kapatılır. */
export const useIsTouch = () => useMediaQuery('(hover: none)')

/** Kullanıcı sistemden hareketi azaltmayı seçmiş mi? */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Kullanıcı veri tasarrufu istiyor mu? Ağır medyayı ertelemek için. */
export const usePrefersReducedData = () => useMediaQuery('(prefers-reduced-data: reduce)')
