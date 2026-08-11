import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { scrollState } from '../store/scroll'
import { smoothstep } from './math'
import { usePerfStore } from './perf'

/**
 * Altın toz — GPU üzerinde çalışan partikül alanı.
 *
 * Her parçacığın hareketi tamamen vertex shader'da hesaplanır; CPU her
 * karede tek bir uniform (zaman) günceller. Bu, 12.000 parçacığı telefonda
 * bile ücretsize yakın kılar — konumları JS'te güncellemek aynı sayıda
 * parçacıkta kare hızını yere serer.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform float uFieldHeight;

  attribute float aScale;
  attribute float aSpeed;
  attribute float aPhase;

  varying float vAlpha;
  varying float vTwinkle;

  void main() {
    vec3 pos = position;

    // Yukarı doğru sonsuz süzülme — alan yüksekliğinde sarmalanır,
    // böylece parçacıklar hiç tükenmez.
    float rise = uTime * aSpeed * 0.09 + aPhase;
    pos.y = mod(pos.y + rise + uFieldHeight * 0.5, uFieldHeight) - uFieldHeight * 0.5;

    // Yanal salınım — havada asılı toz hissi (ucuz sahte türbülans)
    pos.x += sin(rise * 1.30 + aPhase * 2.1) * 0.38;
    pos.z += cos(rise * 0.87 + aPhase * 3.3) * 0.38;

    // Kaydırmayla hafif paralaks: sayfa aktıkça toz aşağıda kalır
    pos.y -= uScroll * 3.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspektife göre boyut — uzaktakiler küçülür
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / max(0.6, -mvPosition.z));

    /*
     * Yakın alan sönümlemesi.
     * Kameraya çok yaklaşan bir parçacık ekranda kocaman, bulanık bir
     * lekeye dönüşür ve metnin önünde "kar yağıyor" hissi verir. Bu
     * yüzden 2 birimden yakındakiler tamamen silinir; toz hep arkada,
     * derinlikte kalır.
     */
    float depth = -mvPosition.z;
    vAlpha = smoothstep(26.0, 9.0, depth) * smoothstep(2.0, 5.0, depth);

    // Işıltı — her parçacık kendi ritminde parlayıp söner
    vTwinkle = 0.45 + 0.55 * sin(uTime * 1.9 * aSpeed + aPhase * 6.283);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uEdge;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vTwinkle;

  void main() {
    // Kare noktayı yumuşak daireye çevir
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);            // length yerine kare — karekök yok
    if (d > 0.25) discard;

    float falloff = pow(1.0 - d * 4.0, 2.4);
    vec3 color = mix(uEdge, uCore, falloff);

    gl_FragColor = vec4(color, falloff * vAlpha * vTwinkle * uOpacity);
  }
`

const FIELD_RADIUS = 9
const FIELD_HEIGHT = 16

export function GoldDust() {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const count = usePerfStore((s) => s.settings.particles)
  const viewport = useThree((s) => s.viewport)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Silindirik dağılım — kameranın etrafını sarar, köşelerde yığılmaz.
      // sqrt: alana göre eşit yoğunluk (yoksa merkez tıka basa dolar)
      const radius = Math.sqrt(Math.random()) * FIELD_RADIUS
      const angle = Math.random() * Math.PI * 2

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_HEIGHT
      positions[i * 3 + 2] = Math.sin(angle) * radius

      // Çoğu küçük, birkaçı belirgin — tekdüze boyut yapay durur.
      scales[i] = 0.3 + Math.pow(Math.random(), 3) * 1.5
      speeds[i] = 0.45 + Math.random() * 1.1
      phases[i] = Math.random() * 10
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    // Küre sınırı: parçacıklar shader'da hareket ettiği için otomatik
    // hesaplanan kutu yanlış olur ve yanlış kırpmaya yol açar.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), FIELD_RADIUS * 2)
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 15 },
      uPixelRatio: { value: 1 },
      uFieldHeight: { value: FIELD_HEIGHT },
      uOpacity: { value: 0.42 },
      // Zeminden KOYU tonlar — açık temada toz ancak kağıttan koyu olursa
      // görünür. Merkez en doygun, kenar kağıda doğru erir.
      uCore: { value: new THREE.Color('#a8873a') },
      uEdge: { value: new THREE.Color('#cbb684') },
    }),
    [],
  )

  useFrame((state, delta) => {
    const u = material.current?.uniforms
    if (!u) return

    u.uTime.value += Math.min(delta, 0.1)
    // Kaydırma değerini yumuşat — ani sıçrama partikülleri zıplatır.
    u.uScroll.value += (scrollState.progress - u.uScroll.value) * 0.06
    u.uPixelRatio.value = state.viewport.dpr

    // Dar ekranda partiküller orantısal olarak büyük görünür; küçült.
    u.uSize.value = viewport.width < 6 ? 12 : 15

    /*
     * İçerik bölümlerinde toz geri çekilir.
     * Hero'da atmosferi o kuruyor; ama metnin arkasında aynı yoğunlukta
     * kalınca okumayı yoruyor ve "ekran koruyucu" hissi veriyor.
     */
    const target = 0.42 - smoothstep(0.05, 0.2, scrollState.progress) * 0.26
    u.uOpacity.value += (target - u.uOpacity.value) * 0.05
  })

  // Geometri değişince (kademe düştüğünde) eski buffer'ları serbest bırak.
  useMemo(() => () => geometry.dispose(), [geometry])

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      {/*
        ⚠️ NormalBlending — koyu temadaki AdditiveBlending DEĞİL.
        Toplamalı harmanlama "üstüne ışık ekler" mantığıyla çalışır ve
        koyu zeminde altın tozu parlatır. Fildişi bir zeminde ise
        eklenecek yer yoktur: beyazdan parlak bir şey olmadığı için
        partiküller tamamen görünmez olur. Açık temada toz, kağıttan
        koyu olarak normal harmanlanmalı.
      */}
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}
