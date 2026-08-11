import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

import { useAppStore } from '../store/useAppStore'
import { CameraRig } from './CameraRig'
import { GoldDust } from './GoldDust'
import { Lighting } from './Lighting'
import { Rings } from './Rings'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { usePerfStore } from './perf'

/**
 * Sabit, tam ekran 3B arka plan.
 *
 * Tek bir kalıcı Canvas tüm sayfanın arkasında durur; DOM bölümleri onun
 * üstünde kayar. Bölüm başına ayrı canvas açmak yerine bunu yapmak hem
 * çok daha performanslı (tek WebGL bağlamı, tek render döngüsü) hem de
 * görsel olarak kesintisiz — kamera bölümler arasında akmaya devam eder.
 *
 * `pointer-events: none` sayesinde canvas hiçbir dokunmayı yakalamaz;
 * kaydırma ve tıklama doğrudan üstteki içeriğe gider.
 */
export default function Scene() {
  const tier = usePerfStore((s) => s.tier)
  const settings = usePerfStore((s) => s.settings)
  const downgrade = usePerfStore((s) => s.downgrade)
  const setWebglFailed = useAppStore((s) => s.setWebglFailed)

  // Hareket azaltma tercihi veya WebGL yokluğu: hiç canvas oluşturma.
  if (tier === 'none') return null

  return (
    // Taban gradyanı `body` üzerinde (styles/index.css) — sahne geç
    // yüklendiği için zemin ondan önce yerinde olmalı.
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <SceneErrorBoundary onError={setWebglFailed}>
        <Canvas
          dpr={[1, settings.maxDpr]}
          camera={{ fov: 38, near: 0.1, far: 80, position: [0, 0, 6] }}
          gl={{
            /*
             * MSAA HER KADEMEDE AÇIK.
             *
             * Koyu temada kenar tırtıklarını karanlık yutuyordu; fildişi
             * zeminde altın bir halkanın basamaklı silueti anında göze
             * çarpıyor. Bu, açık temada bloom'dan çok daha önemli — nitekim
             * son işleme zinciri tam da bunun için kaldırıldı (aşağıya bak).
             */
            antialias: true,
            /*
             * ŞEFFAF CANVAS — sayfa zemininin tek sahibi CSS.
             *
             * Önce sahnenin içinde CSS gradyanının bir kopyası vardı.
             * Ama tone mapping 0.8 üstü değerleri sıkıştırır ve fildişi
             * beyaz tam o aralıkta: kopya griye kayıyor, CSS'teki asıl
             * zeminle tutmuyordu. Üstelik postprocess'in kapalı olduğu
             * `low` kademede sıkıştırma olmadığı için kademeler arasında
             * da renk değişiyordu.
             *
             * Şeffaf canvas bu sınıf hatayı tamamen ortadan kaldırır:
             * zemin tek yerde tanımlı, hiçbir eğriden geçmiyor, her
             * kademede birebir aynı. Sahne yalnızca yüzükleri ve tozu
             * çiziyor.
             */
            alpha: true,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
            /*
             * Khronos PBR Neutral — R3F varsayılanı ACES Filmic DEĞİL.
             * ACES ve AgX sinematik, koyu sahneler için yapılmış filmik
             * eğriler; parlak alanların doygunluğunu bilerek düşürüp
             * altını soluk, cansız bir sarıya çeviriyorlardı. Neutral tam
             * olarak beyaz zeminde ürün görselleştirmesi için tasarlandı:
             * rengi korur, yalnızca parlama uçlarını yuvarlar.
             */
            toneMapping: THREE.NeutralToneMapping,
          }}
          onCreated={({ gl }) => {
            gl.setClearAlpha(0)
          }}
        >
          {/*
            Kare hızı düşerse kademe in. `flipflops` ile birkaç kez
            gidip gelmeden karar vermez — tek bir takılma yüzünden
            kaliteyi düşürmesin.
          */}
          <PerformanceMonitor onDecline={downgrade} flipflops={3} ms={250} iterations={6}>
            <Suspense fallback={null}>
              <Lighting />
              <Rings />
              <GoldDust />
              <CameraRig />
            </Suspense>
          </PerformanceMonitor>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
