import { useEffect } from 'react'

import { pointerState } from '../store/scroll'

/**
 * İmleç konumunu -1…1 aralığında izler (React state'i olmadan).
 *
 * 📱 Yalnızca gerçek imleci olan cihazlarda devreye girer. Dokunmatikte
 * "son dokunulan nokta" imleç gibi davranırsa kamera parmağın kalktığı
 * yerde kilitli kalır — bu yüzden orada hiç dinlenmez.
 */
export function usePointerTracking(): void {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointerState.active = true
    }

    const onLeave = () => {
      pointerState.x = 0
      pointerState.y = 0
      pointerState.active = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [])
}
