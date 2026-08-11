/**
 * Kare bazlı global durum — bilinçli olarak React state'i DEĞİL.
 *
 * Kaydırma ve imleç saniyede 60–120 kez değişir. Bunları React state'ine
 * bağlamak her karede yeniden render tetikler ve telefonda kare düşmesine
 * yol açar. Bunun yerine değerler bu değişebilir nesnelerde tutulur; 3B
 * sahne onları `useFrame` içinden doğrudan okur, DOM tarafı ise
 * IntersectionObserver kullanır. Kaydırma sırasında sıfır React render'ı.
 */

export const scrollState = {
  /** Sayfanın toplam ilerlemesi, 0 → 1 */
  progress: 0,
  /** Anlık hız — partikül sürüklenmesi ve hareket ipuçları için */
  velocity: 0,
  /** Piksel cinsinden konum */
  offset: 0,
}

export const pointerState = {
  /** Yatay konum, -1 (sol) → 1 (sağ) */
  x: 0,
  /** Dikey konum, -1 (alt) → 1 (üst) */
  y: 0,
  /** Gerçek bir imleç var mı? Dokunmatikte paralaks uygulanmaz. */
  active: false,
}
