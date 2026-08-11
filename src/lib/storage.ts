/**
 * Güvenli localStorage sarmalayıcı.
 *
 * Gizli sekmede, çerezleri kapalı tarayıcılarda ve bazı uygulama içi
 * tarayıcılarda (WhatsApp / Instagram WebView) localStorage erişimi
 * istisna fırlatır. Davetiye bu yüzden çökmemeli.
 */

const available = (() => {
  try {
    const k = '__probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
})()

/** Erişim yoksa bellekte tutulur — oturum boyunca yine de çalışır. */
const memory = new Map<string, string>()

export const storage = {
  get(key: string): string | null {
    if (!available) return memory.get(key) ?? null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key: string, value: string): void {
    if (!available) {
      memory.set(key, value)
      return
    }
    try {
      localStorage.setItem(key, value)
    } catch {
      memory.set(key, value)
    }
  },

  remove(key: string): void {
    memory.delete(key)
    if (!available) return
    try {
      localStorage.removeItem(key)
    } catch {
      /* yok sayılır */
    }
  },
}

export const STORAGE_KEYS = {
  introSeen: 'davetiye:intro-izlendi',
  audioMuted: 'davetiye:muzik-kapali',
} as const
