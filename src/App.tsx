import { Suspense, lazy, useEffect } from 'react'

import { GoldCursor } from './components/GoldCursor'
import { GrainOverlay } from './components/GrainOverlay'
import { MusicToggle } from './components/MusicToggle'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useAudioUnlock } from './hooks/useAudioUnlock'
import { usePointerTracking } from './hooks/usePointerTracking'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Closing } from './sections/Closing'
import { Countdown } from './sections/Countdown'
import { Details } from './sections/Details'
import { Reel, StoryFilm } from './sections/Films'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Overture } from './sections/Overture'
import { useAppStore } from './store/useAppStore'

/*
 * three.js + drei ≈ 180 KB (gzip) — uygulamanın geri
 * kalanının iki katından fazla. Statik import edilseydi ilk boyamayı
 * bloklardı; oysa ziyaretçi o sırada monogramı ve zarfı görüyor, 3B
 * sahneye ancak saniyeler sonra ihtiyaç duyuluyor.
 *
 * Ayrı bir chunk olarak arka planda indirilir; hazır olmadan önce
 * fallback yok — arkasındaki CSS gradyanı zaten doğru zemini veriyor.
 */
const Scene = lazy(() => import('./three/Scene'))

export function App() {
  const phase = useAppStore((s) => s.phase)
  const ready = phase === 'invitation'

  useSmoothScroll()
  usePointerTracking()
  useAudioUnlock()
  useAudioEngine()
  useScrollLock(!ready)

  return (
    <>
      {/*
        Sahne yükleme ekranı bitene kadar HİÇ mount edilmez.
        `lazy()` tek başına yetmiyordu: Scene ilk render'da mount olduğu
        için three chunk'ı da anında isteniyordu ve ilk saniyelerde
        fontlarla bant genişliği için yarışıyordu. Zarf ekranına
        geçildiğinde indirilmeye başlar; ziyaretçi mühre dokunana kadar
        fazlasıyla vakit var ve o sırada ekranı zaten zarf kaplıyor.
      */}
      {phase !== 'loading' && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}

      <main
        className="relative z-10 transition-opacity duration-1000"
        // Açılış sekansı sürerken içerik ekran okuyucudan ve klavyeden
        // gizlenir; arkada gezinilebilir bir sayfa kalmaz.
        aria-hidden={!ready}
        inert={!ready}
        style={{ opacity: ready ? 1 : 0 }}
      >
        {/*
          Sıra bilinçli: önce "ne zaman ve nerede" (geri sayım, tarih,
          düğün kartı ve hemen altında mekân/navigasyon), sonra "kim"
          (anılar, varsa filmler), en sonda kapanış.
        */}
        <Hero />
        <Countdown />
        <Details />
        <Gallery />
        <StoryFilm />
        <Reel />
        <Closing />
      </main>

      <MusicToggle />
      <GrainOverlay />
      <GoldCursor />
      <Overture />
    </>
  )
}

/**
 * Açılış sekansı sürerken sayfanın kaydırılmasını engeller.
 *
 * 📱 Mobilde `overflow: hidden` tek başına yetmez — iOS Safari sayfayı
 * yine de "lastik bant" gibi çeker. `position: fixed` + kaydırma konumunu
 * geri yükleme kalıbı bunu kesin olarak durdurur.
 */
function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return

    const { body } = document
    const scrollY = window.scrollY
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.overflow = previous.overflow
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
