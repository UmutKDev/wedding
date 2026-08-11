import { useEffect, useRef, useState } from 'react'

/**
 * Masaüstünde imleci takip eden ince altın halka.
 *
 * 📱 Dokunmatikte HİÇ mount edilmez — telefonda imleç diye bir şey yok,
 * "son dokunulan nokta"yı takip eden bir halka ekranda unutulmuş bir leke
 * gibi durur.
 *
 * Konum React state'i ile değil, doğrudan `transform` ile güncellenir:
 * fare hareketi saniyede 100+ olay üretir, her biri için render almak
 * savurganlık olurdu.
 *
 * Yerel imleç ancak bu bileşen başarıyla bağlandıktan sonra gizlenir —
 * JavaScript bir sebeple çalışmazsa kullanıcı imleçsiz kalmaz.
 */
export function GoldCursor() {
  const ring = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setEnabled(true)

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const current = { ...target }
    let hovering = false
    let frame = 0

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY

      // Tıklanabilir bir şeyin üstünde mi? Halka büyüyüp doluyor.
      const el = e.target as Element | null
      hovering = Boolean(el?.closest?.('a, button, summary, [role="button"]'))
    }

    const loop = () => {
      // Hafif gecikme — halka imlecin peşinden akıcı biçimde sürüklenir.
      current.x += (target.x - current.x) * 0.18
      current.y += (target.y - current.y) * 0.18

      const el = ring.current
      if (el) {
        const scale = hovering ? 1.9 : 1
        el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${scale})`
        el.style.opacity = hovering ? '0.95' : '0.55'
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })

    // Yerel imleci ancak buraya kadar geldiysek gizle.
    document.documentElement.style.cursor = 'none'

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.style.cursor = ''
    }
  }, [])

  if (!enabled) return null

  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[200] h-6 w-6 rounded-full"
      style={{
        border: '1px solid var(--color-gold)',
        transition: 'opacity 240ms ease',
        willChange: 'transform',
      }}
    />
  )
}
