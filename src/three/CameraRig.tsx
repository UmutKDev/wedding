import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { pointerState, scrollState } from '../store/scroll'
import { clamp, fitDistance, smoothstep } from './math'

/**
 * Kaydırmaya bağlı kamera.
 *
 * Konum küresel koordinatlarla tanımlanır (azimut / yükseklik / mesafe);
 * böylece anahtar kareler arasında geçiş doğal bir YÖRÜNGE olur, düz bir
 * çizgide kayma değil.
 *
 * 📱 Mesafe ekran oranına göre yeniden hesaplanır. Dikey telefon ekranında
 * yatay görüş alanı çok dardır — sabit bir mesafe kullansaydık yüzükler
 * masaüstünde düzgün, telefonda kenarlardan taşmış görünürdü.
 */

interface Keyframe {
  /** Kaydırma ilerlemesi 0→1 */
  at: number
  /** Y ekseni etrafında dönüş (radyan) */
  azimuth: number
  /** Yatay düzlemin üstündeki açı (radyan) */
  elevation: number
  /** Kadraja oturma mesafesinin katı — 1.0 = tam sığar */
  dist: number
  /** Kameranın baktığı noktanın yüksekliği */
  lookY: number
  fov: number
}

const KEYFRAMES: Keyframe[] = [
  // Açılış: yüzüklere yakın, hafif yandan — hero metninin arkasında
  { at: 0.0, azimuth: 0.18, elevation: 0.06, dist: 1.0, lookY: 0, fov: 38 },
  // Geri çekiliş: toz alanı ortaya çıkar
  { at: 0.14, azimuth: -0.45, elevation: 0.24, dist: 1.55, lookY: -0.1, fov: 40 },
  // Orta bölümler: derin, sakin, boş — metnin okunduğu yer
  { at: 0.42, azimuth: -1.7, elevation: 0.04, dist: 2.0, lookY: -0.3, fov: 42 },
  { at: 0.7, azimuth: 0.95, elevation: 0.38, dist: 2.05, lookY: -0.15, fov: 42 },
  // Kapanışa dönüş: yüzükler yeniden belirir
  { at: 0.9, azimuth: 0.32, elevation: 0.14, dist: 1.3, lookY: 0.05, fov: 38 },
  { at: 1.0, azimuth: 0.0, elevation: 0.07, dist: 1.08, lookY: 0.1, fov: 36 },
]

/** Yüzük grubunun kabaca kapladığı yarıçap (+ nefes payı) */
const SUBJECT_RADIUS = 1.55

/** İki anahtar kare arasında yumuşak geçişle ara değer üret */
function sample(p: number): Keyframe {
  if (p <= KEYFRAMES[0].at) return KEYFRAMES[0]
  const last = KEYFRAMES[KEYFRAMES.length - 1]
  if (p >= last.at) return last

  let i = 0
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].at < p) i++

  const a = KEYFRAMES[i]
  const b = KEYFRAMES[i + 1]
  const t = smoothstep(a.at, b.at, p)

  return {
    at: p,
    azimuth: a.azimuth + (b.azimuth - a.azimuth) * t,
    elevation: a.elevation + (b.elevation - a.elevation) * t,
    dist: a.dist + (b.dist - a.dist) * t,
    lookY: a.lookY + (b.lookY - a.lookY) * t,
    fov: a.fov + (b.fov - a.fov) * t,
  }
}

export function CameraRig() {
  const target = useRef(new THREE.Vector3())
  const lookAt = useRef(new THREE.Vector3())
  const size = useThree((s) => s.size)

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera
    const dt = Math.min(delta, 0.1)
    const k = sample(scrollState.progress)

    // — Ekran oranına göre gerçek mesafe —
    const aspect = size.width / Math.max(1, size.height)
    const base = fitDistance(SUBJECT_RADIUS, k.fov, aspect)
    const radius = base * k.dist

    // — Küresel → kartezyen —
    const cosEl = Math.cos(k.elevation)
    target.current.set(
      Math.sin(k.azimuth) * cosEl * radius,
      Math.sin(k.elevation) * radius + k.lookY,
      Math.cos(k.azimuth) * cosEl * radius,
    )

    /*
     * İmleç paralaksı — yalnızca gerçek imleci olan cihazlarda.
     * Dokunmatikte imleç son dokunuşta takılı kalacağı için `active`
     * hiç true olmaz ve kamera yamuk durmaz. Etkisi yalnızca hero'da
     * hissedilir, aşağı inildikçe sıfırlanır.
     */
    if (pointerState.active) {
      const heroWeight = 1 - smoothstep(0, 0.2, scrollState.progress)
      const parallax = heroWeight * 0.3
      target.current.x += pointerState.x * parallax
      target.current.y += pointerState.y * parallax * 0.6
    }

    // Kritik sönümleme: hedefe yumuşak yaklaşım, kare hızından bağımsız.
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, 3.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, 3.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, 3.2, dt)

    /*
     * Kamera özneye doğrudan bakar; dikey kadraj kaydırması YOK.
     *
     * Önceden kamera biraz aşağıya bakıyordu ki yüzükler karenin üstüne
     * otursun ve altta hero metnine yer kalsın. Hero'yu artık düğün
     * arabası videosu kapladığı için yüzükler bir ekran aşağıya, geri
     * sayımın arkasına taşındı (bkz. Rings.tsx). Orada kartlar ekranın
     * üst yarısında olduğundan özneyi yukarı itmek onu kartların
     * arkasına sokardı — ortalanmış hâli doğru olan.
     */
    lookAt.current.set(0, THREE.MathUtils.damp(lookAt.current.y, k.lookY, 3, dt), 0)
    camera.lookAt(lookAt.current)

    const fov = THREE.MathUtils.damp(camera.fov, clamp(k.fov, 30, 55), 3, dt)
    if (Math.abs(fov - camera.fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}
