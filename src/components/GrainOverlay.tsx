/**
 * Sayfanın tamamını kaplayan film greni / kağıt dokusu.
 *
 * 3B sahnedeki gren yalnızca canvas'ı kapsar; üstündeki metin ve kartlar
 * tertemiz kalır ve bu ayrım gözle fark edilir — yazılar sahnenin üstüne
 * "yapıştırılmış" gibi durur. Bu katman ikisini tek bir görüntüde birleştirir.
 *
 * Harman modu `multiply` — koyu temadaki `overlay` DEĞİL. Overlay açık
 * zeminde neredeyse hiçbir şey yapmıyor (parlak pikselleri daha da
 * parlatıyor, zaten beyaz olduğu için değişmiyor). Multiply ise dokuyu
 * kağıdın üstüne basar: fildişi bir davetiye kartının gerçek dokusu.
 */
export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] opacity-[0.04] mix-blend-multiply"
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <filter id="film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
          {/* Renkten arındır — renkli gren dijital gürültü gibi durur */}
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>
    </div>
  )
}
