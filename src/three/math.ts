/** GLSL smoothstep'in JS karşılığı — 0↔1 arası yumuşak geçiş */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Değeri aralığa sıkıştırır */
export const clamp = (x: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, x))

/** Doğrusal ara değer */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/**
 * Nesnenin verilen yarıçapla kadraja tam oturması için gereken kamera mesafesi.
 *
 * 📱 Dikey ekranda kritik: 375×812 gibi dar bir kadrajda yatay görüş alanı
 * dikeyden çok daha küçüktür. İkisinin darını hesaba katmazsak yüzükler
 * telefonda kenarlardan taşar.
 */
export function fitDistance(radius: number, fovDeg: number, aspect: number): number {
  const vFov = (fovDeg * Math.PI) / 180
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
  return radius / Math.tan(Math.min(vFov, hFov) / 2)
}
