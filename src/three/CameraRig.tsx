import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { pointerState, scrollState } from '../store/scroll'

/**
 * Kamera sürüklenmesi.
 *
 * Sahnede artık yalnızca altın toz var; kadrajlanacak bir özne yok.
 * Bu yüzden buradaki tek iş TOZA PARALAKS KAZANDIRMAK: kamera çok yavaş
 * hareket ettikçe farklı derinlikteki parçacıklar farklı hızda kayar ve
 * düz bir doku yerine hacimli bir alan gibi okunur.
 *
 * Önceden burada yüzükleri çerçevelemek için küresel koordinatlı bir
 * anahtar kare sistemi vardı (yörünge, FOV geçişleri, ekran oranına göre
 * mesafe hesabı). Yüzükler kalkınca hepsi ölü ağırlığa dönüştü.
 */
export function CameraRig() {
  const lookAt = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const camera = state.camera
    // Sekme arka plandayken delta devasa olabilir — sıçramayı engelle.
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime
    const p = scrollState.progress

    /*
     * İki katmanlı hareket:
     *  • zamana bağlı çok yavaş salınım — sayfa dururken bile sahne canlı
     *  • kaydırmaya bağlı kayma — aşağı indikçe toz yukarı akıyormuş hissi
     */
    let targetX = Math.sin(t * 0.07) * 0.85 + (p - 0.5) * 1.8
    let targetY = Math.cos(t * 0.05) * 0.45 - p * 1.4

    // İmleç paralaksı — dokunmatikte `active` hiç true olmaz.
    if (pointerState.active) {
      targetX += pointerState.x * 0.45
      targetY += pointerState.y * 0.28
    }

    // Kritik sönümleme: hedefe yumuşak yaklaşım, kare hızından bağımsız.
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 7, 2.2, dt)

    lookAt.current.set(0, 0, 0)
    camera.lookAt(lookAt.current)
  })

  return null
}
