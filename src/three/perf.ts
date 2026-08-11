import { create } from 'zustand'

/**
 * Cihaz performans kademesi.
 *
 *  high   → masaüstü / üst seviye telefon: 12k partikül, tektaş, tam DPR
 *  medium → modern telefonlar: 5k partikül, tektaş yok
 *  low    → giriş seviyesi telefon: 1.5k partikül, düşük DPR
 *  none   → WebGL yok veya hareket azaltma açık: statik 2B fallback
 *
 * Kenar yumuşatma (MSAA) kademeye BAĞLI DEĞİL, her yerde açık: fildişi
 * zeminde tırtıklı bir siluet en ucuz telefonda bile göze batar.
 */
export type PerfTier = 'high' | 'medium' | 'low' | 'none'

export interface TierSettings {
  /** GPU partikül sayısı */
  particles: number
  /** Cihaz piksel oranı üst sınırı — mobilde en pahalı ayar budur */
  maxDpr: number
  /** Yüzükteki tektaş (ışık kırılması) */
  solitaire: boolean
  /** Cam kaide (transmission materyali — çok pahalı) */
  glassPedestal: boolean
  /** Gölge haritaları */
  shadows: boolean
  /** Torus segment sayısı — silüet pürüzsüzlüğü */
  ringSegments: [radial: number, tubular: number]
}

export const TIER_SETTINGS: Record<Exclude<PerfTier, 'none'>, TierSettings> = {
  high: {
    particles: 12_000,
    maxDpr: 2,
    solitaire: true,
    glassPedestal: true,
    shadows: true,
    ringSegments: [64, 256],
  },
  medium: {
    particles: 5_000,
    maxDpr: 1.75,
    // Tektaş yalnızca üst kademede: geçirgen malzeme olmadan donuk gri
    // bir üçgen gibi duruyor — hiç olmaması daha iyi.
    solitaire: false,
    glassPedestal: false,
    shadows: false,
    ringSegments: [32, 128],
  },
  low: {
    particles: 1_500,
    maxDpr: 1.25,
    solitaire: false,
    glassPedestal: false,
    shadows: false,
    ringSegments: [26, 104],
  },
}

/** WebGL2 desteği var mı? Bağlam hemen serbest bırakılır. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

const TIERS: PerfTier[] = ['high', 'medium', 'low', 'none']

/**
 * Geliştirme/test için kademe zorlama: `?tier=high` gibi.
 * Her kademenin gerçekte nasıl göründüğünü cihaz değiştirmeden görmeyi sağlar.
 */
function tierOverride(): PerfTier | null {
  try {
    const value = new URLSearchParams(window.location.search).get('tier')
    return TIERS.includes(value as PerfTier) ? (value as PerfTier) : null
  } catch {
    return null
  }
}

/**
 * İlk kademe tahmini.
 *
 * Amaç iyimser ama güvenli olmak: modern bir telefon 'medium' ile başlar,
 * gerçekten yavaşsa `PerformanceMonitor` çalışırken 'low'a düşürür.
 * Tersini yapmak (düşükten başlayıp yükseltmek) ilk izlenimi mahveder.
 */
function detectTier(): PerfTier {
  if (typeof window === 'undefined') return 'none'

  const forced = tierOverride()
  if (forced) return forced

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'none'
  if (!hasWebGL()) return 'none'

  const cores = navigator.hardwareConcurrency ?? 4
  // deviceMemory yalnızca Chromium'da var; yoksa varsayım yapma.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const isMobile = window.matchMedia('(hover: none)').matches

  if (isMobile) {
    // Zayıf sinyal: az çekirdek veya düşük bellek → düşük kademe.
    if (cores <= 4 || (memory !== undefined && memory <= 3)) return 'low'
    return 'medium'
  }

  if (cores >= 8 && (memory === undefined || memory >= 8)) return 'high'
  return 'medium'
}

interface PerfState {
  tier: PerfTier
  settings: TierSettings
  /** Kullanıcı hareket azaltma seçtiyse veya WebGL yoksa true */
  disabled: boolean
  /** Çalışma anında kare hızı düşerse bir kademe in. */
  downgrade: () => void
  set: (tier: PerfTier) => void
}

const settingsFor = (tier: PerfTier): TierSettings =>
  tier === 'none' ? TIER_SETTINGS.low : TIER_SETTINGS[tier]

const NEXT_DOWN: Record<PerfTier, PerfTier> = {
  high: 'medium',
  medium: 'low',
  low: 'low', // en alt kademe — daha aşağı inme, 3B'yi tamamen kapatma
  none: 'none',
}

export const usePerfStore = create<PerfState>((set, get) => {
  const tier = detectTier()
  // `?tier=` ile zorlandıysa çalışma anında düşürme devre dışı — yoksa
  // test etmek istediğin kademede kalamazsın.
  const locked = tierOverride() !== null

  return {
    tier,
    settings: settingsFor(tier),
    disabled: tier === 'none',

    downgrade: () => {
      if (locked) return
      const next = NEXT_DOWN[get().tier]
      if (next === get().tier) return
      if (import.meta.env.DEV) {
        console.info(`%c⚡ Performans kademesi düşürüldü → ${next}`, 'color:#B8912F')
      }
      set({ tier: next, settings: settingsFor(next), disabled: next === 'none' })
    },

    set: (t) => set({ tier: t, settings: settingsFor(t), disabled: t === 'none' }),
  }
})
