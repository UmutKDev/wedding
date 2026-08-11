import { create } from 'zustand'
import { STORAGE_KEYS, storage } from '../lib/storage'

/**
 * Davetiyenin aşamaları.
 *
 *  loading    → varlıklar yükleniyor, monogram çiziliyor
 *  envelope   → mühürlü zarf, "Davetiyeyi Aç" bekleniyor
 *  intro      → açılış filmi tam ekran oynuyor
 *  invitation → davetiyenin kendisi (kaydırılabilir)
 */
export type Phase = 'loading' | 'envelope' | 'intro' | 'invitation'

interface AppState {
  phase: Phase
  /** Kullanıcı daha önce açılışı izlemiş mi? (localStorage) */
  introSeen: boolean

  /** Kullanıcı bir kez ekrana dokundu mu? Tarayıcı ses kilidi buna bağlı. */
  audioUnlocked: boolean
  /** Müzik kullanıcı tarafından kapatılmış mı? */
  muted: boolean
  /** Bir video oynuyor mu? Öyleyse müzik geçici olarak kısılır. */
  ducked: boolean

  /** WebGL başlatılamadıysa true — 2B fallback'e geçilir. */
  webglFailed: boolean

  setPhase: (phase: Phase) => void
  beginInvitation: () => void
  unlockAudio: () => void
  toggleMuted: () => void
  setDucked: (ducked: boolean) => void
  setWebglFailed: () => void
  replayIntro: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  phase: 'loading',
  introSeen: storage.get(STORAGE_KEYS.introSeen) === '1',

  audioUnlocked: false,
  muted: storage.get(STORAGE_KEYS.audioMuted) === '1',
  ducked: false,

  webglFailed: false,

  setPhase: (phase) => set({ phase }),

  /** Açılış bitti (veya atlandı) — davetiyeye geç ve izlendi olarak işaretle. */
  beginInvitation: () => {
    storage.set(STORAGE_KEYS.introSeen, '1')
    set({ phase: 'invitation', introSeen: true })
  },

  /** İlk kullanıcı hareketinde çağrılır; sesin çalmasına izin verir. */
  unlockAudio: () => {
    if (get().audioUnlocked) return
    set({ audioUnlocked: true })
  },

  toggleMuted: () => {
    const muted = !get().muted
    storage.set(STORAGE_KEYS.audioMuted, muted ? '1' : '0')
    set({ muted })
  },

  setDucked: (ducked) => set({ ducked }),

  setWebglFailed: () => set({ webglFailed: true }),

  replayIntro: () => set({ phase: 'intro' }),
}))
