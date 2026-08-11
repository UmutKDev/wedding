import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { scrollState } from '../store/scroll'
import { usePerfStore } from './perf'
import { smoothstep } from './math'

/**
 * İç içe geçmiş iki altın nikah yüzüğü.
 *
 * Malzeme fiziksel olarak doğru altın: metallerde taban rengi "boya rengi"
 * değil YANSIMA rengidir; 18 ayar altının doğrusal uzaydaki yansıması
 * ≈ (1.00, 0.77, 0.34). Pürüzlülük düşük ama sıfır değil — kusursuz ayna
 * cansız görünür, hafif fırçalanma metali gerçek yapar.
 */

const GOLD = new THREE.Color().setRGB(1.0, 0.766, 0.336, THREE.LinearSRGBColorSpace)
const GOLD_WARM = new THREE.Color().setRGB(1.0, 0.71, 0.29, THREE.LinearSRGBColorSpace)

/** Fırçalanmış altın için prosedürel normal haritası — dosya indirmez. */
function useBrushedNormal(): THREE.Texture {
  return useMemo(() => {
    const size = 128
    const data = new Uint8Array(size * size * 4)

    for (let y = 0; y < size; y++) {
      // Satır boyunca aynı çizik: torusun çevresinde dönen fırçalama izi.
      const scratch = Math.sin(y * 2.7) * 0.5 + Math.sin(y * 11.3) * 0.3
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        data[i] = 128 + (scratch + (Math.random() - 0.5) * 0.35) * 14 // X
        data[i + 1] = 128 // Y
        data[i + 2] = 255 // Z — çoğunlukla yüzey normali
        data[i + 3] = 255
      }
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 24)
    tex.needsUpdate = true
    return tex
  }, [])
}

interface RingProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color: THREE.Color
  segments: [number, number]
  normalMap: THREE.Texture
}

function Ring({ position, rotation, color, segments, normalMap }: RingProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <torusGeometry args={[0.8, 0.085, segments[0], segments[1]]} />
      {/*
        Anizotropi bilinçli olarak KULLANILMIYOR: torus geometrisinde
        tanjant özniteliği yok, three tanjantı türevlerden tahmin ediyor
        ve fırçalama normal haritasıyla birleşince parlamalarda kararsız,
        yeşilimsi renk kaymaları çıkıyor. Fırçalanmış metal hissini
        normal haritası + rim ışıkları zaten veriyor.
      */}
      {/*
        `envMapIntensity` açık stüdyoda düşürüldü (1.75 → 1.05) ve
        pürüzlülük hafifçe artırıldı: parlak bir ortamda eski değerler
        metali doyuma sokup beyaza yıkıyor, altın rengi kayboluyordu.
      */}
      <meshPhysicalMaterial
        color={color}
        metalness={1}
        roughness={0.22}
        envMapIntensity={1.05}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.11, 0.11)}
      />
    </mesh>
  )
}

/**
 * Tektaş — yalnızca üst kademede.
 *
 * `dispersion` elmasın prizmatik ateşini verir: ışığı dalga boyuna göre
 * ayırır. Geçirgenlik ek bir render geçişi gerektirdiği için pahalıdır;
 * onsuz taş donuk gri bir üçgene dönüştüğünden alt kademelerde hiç
 * gösterilmiyor.
 */
function Solitaire() {
  const geometry = useMemo(() => {
    // Yuvarlak kesime yakın: sekizyüzlü, dikeyde uzatılmış.
    const g = new THREE.OctahedronGeometry(0.105, 0)
    g.scale(1, 1.35, 1)
    return g
  }, [])

  return (
    <group position={[0.42, 0.83, 0.04]} rotation={[0, 0.4, 0]}>
      {/* Tırnak yuvası */}
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.05, 0.072, 0.06, 12]} />
        <meshPhysicalMaterial color={GOLD} metalness={1} roughness={0.22} envMapIntensity={1.4} />
      </mesh>

      {/* Taş */}
      <mesh geometry={geometry} position={[0, 0.05, 0]}>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.015}
          transmission={1}
          thickness={0.32}
          ior={2.42}
          // three'de dispersion 0–1 aralığında okunur; yüksek değerler
          // elmasa "ateş" değil, bozuk bir gökkuşağı verir.
          dispersion={0.45}
          envMapIntensity={2.4}
          specularIntensity={1}
        />
      </mesh>
    </group>
  )
}

export function Rings() {
  const group = useRef<THREE.Group>(null)
  const settings = usePerfStore((s) => s.settings)
  const normalMap = useBrushedNormal()

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    // Sekme arka plandayken delta devasa olabilir — sıçramayı engelle.
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime

    /*
     * Salınım — sürekli dönüş DEĞİL. Yüzükler tam tur atarsa periyodik
     * olarak profilden görünüp ince bir çizgiye iner ve "iki yüzük"
     * okunaklılığını kaybeder. Sınırlı bir yalpalama hem sürekli canlı
     * tutar hem de siluet her an tanınır kalır.
     */
    g.rotation.y = Math.sin(t * 0.19) * 0.42 + 0.12
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, Math.sin(t * 0.31) * 0.1, 3, dt)
    g.rotation.z = Math.sin(t * 0.24) * 0.05

    /*
     * Yüzükler İKİNCİ EKRANDA sahnede — hero'da değil.
     *
     * Hero'yu artık düğün arabası videosu kaplıyor ve video canvas'ın
     * üstünde duruyor; yüzükler orada dursaydı hiç görünmeden GPU
     * yakarlardı. Bir ekran aşağıda, geri sayımın arkasındaki temiz
     * fildişi alanda kendilerine yer buluyorlar.
     *
     * Video yoksa `BackgroundVideo` hiçbir şey render etmez ve hero
     * kendiliğinden boş kalır — yüzükler o durumda da ilk ekranın
     * sonuna doğru belirmeye başlar, sahne boş kalmaz.
     *
     * Ölçüt YÜZDE DEĞİL, ekran yüksekliği cinsinden mutlak mesafe.
     * Yüzde kırılgan olurdu: içerik uzadıkça aynı yüzde çok daha aşağıya
     * denk gelir ve yüzükler bambaşka bir bölümün arkasında belirirdi.
     */
    const screens = scrollState.offset / Math.max(1, state.size.height)
    const presence =
      smoothstep(0.35, 0.85, screens) * (1 - smoothstep(1.45, 2.1, screens))

    const scale = THREE.MathUtils.damp(g.scale.x, 0.001 + presence, 4, dt)
    g.scale.setScalar(scale)
    g.visible = scale > 0.015
  })

  return (
    <group ref={group} scale={0.001}>
      {/* Sol yüzük — hafifçe geride ve içe dönük */}
      <Ring
        position={[-0.42, 0, -0.04]}
        rotation={[0.14, -0.38, 0.12]}
        color={GOLD}
        segments={settings.ringSegments}
        normalMap={normalMap}
      />
      {/* Sağ yüzük — öne yakın, ters açı: ikisi kesişerek kilitlenir */}
      <Ring
        position={[0.42, 0, 0.04]}
        rotation={[-0.1, 0.42, -0.1]}
        color={GOLD_WARM}
        segments={settings.ringSegments}
        normalMap={normalMap}
      />

      {settings.solitaire && <Solitaire />}
    </group>
  )
}
