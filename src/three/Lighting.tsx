import { Environment, Lightformer } from '@react-three/drei'

/**
 * Sahne ışıklandırması — açık, fildişi bir stüdyo.
 *
 * ⚠️ EN ÖNEMLİ DETAY: KOYU GOBO ŞERİDİ
 *
 * Parlak metal kendi rengiyle değil, YANSITTIĞI ŞEYLE görünür. Her yanı
 * beyaz olan bir ortamda altın yüzük her yönden aynı parlaklığı yansıtır
 * ve düz, sarıya boyanmış bir halkaya döner — kıvrımı, kalınlığı, tornası
 * kaybolur. Ürün fotoğrafçıları bu yüzden beyaz çekimlerde bile ışığın
 * yanına siyah kartonlar (gobo / negatif dolgu) koyar.
 *
 * Aşağıdaki iki koyu Lightformer tam olarak o iş için. Sahneye ışık
 * eklemezler, tersine metalin üstünde koyu bir yansıma bandı oluşturup
 * forma kontur verirler. Onlar olmadan yüzükler açık zeminde ucuz durur.
 *
 * Ayrıca HDR dosyası indirilmez: ortam haritası bu düzlemlerden anlık
 * pişirilir (`frames={1}` — bir kez, sonra bedava). `resolution` bilinçli
 * olarak performans kademesine bağlanmaz; prop değişirse Environment
 * yeniden bağlanır, boş pişebilir ve metal tamamen siyah kalır.
 */
export function Lighting() {
  return (
    <>
      {/* Açık sahnenin taban dolgusu — gölgeler ölü gri olmasın */}
      <ambientLight intensity={0.55} color="#fff6e8" />

      {/* Ana anahtar ışık — sağ üstten, gün ışığı sıcaklığında */}
      <directionalLight position={[4, 6, 5]} intensity={1.9} color="#fff4dd" />
      {/* Dolgu — soldan yumuşak */}
      <directionalLight position={[-5, 1, 3]} intensity={0.9} color="#f6efe4" />
      {/* Arkadan kontur — silüeti fildişi zeminden ayırır */}
      <directionalLight position={[-1, 2, -6]} intensity={1.1} color="#ffd9a0" />

      <Environment resolution={128} frames={1} background={false}>
        {/* Geniş tepe softbox'ı — yüzüğün üst kavisindeki ana parlama */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#fffaf0"
          position={[0, 5, 1]}
          scale={[10, 6, 1]}
          target={[0, 0, 0]}
        />

        {/* Sağ softbox — sıcak, altına rengini veren yansıma */}
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#ffd9a0"
          position={[4.5, 0.5, 1]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />

        {/* Sol softbox — nötr fildişi dolgu */}
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#f7f2e8"
          position={[-4.5, 1, 1]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />

        {/* ── NEGATİF DOLGU (gobo) — ışık değil, koyu yansıma bandı ── */}
        <Lightformer
          form="rect"
          intensity={0.06}
          color="#241f18"
          position={[-2.6, -0.4, 3.4]}
          scale={[1.6, 7, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.06}
          color="#2e2820"
          position={[2.2, -1.6, 3.2]}
          scale={[5, 1.4, 1]}
          target={[0, 0, 0]}
        />

        {/* Önden dar nokta — kameraya dönen keskin parıltı */}
        <Lightformer
          form="circle"
          intensity={2.4}
          color="#ffffff"
          position={[0.8, 1.8, 4]}
          scale={1.8}
          target={[0, 0, 0]}
        />
      </Environment>
    </>
  )
}
