import { useEffect } from 'react'

import { useAppStore } from '../store/useAppStore'

/**
 * İlk kullanıcı hareketinde ses kilidini açar.
 *
 * Normalde bunu "Davetiyeyi Aç" dokunuşu yapar. Ama açılışı daha önce
 * izlemiş ziyaretçide o ekran hiç gösterilmez; bu durumda sayfadaki ilk
 * dokunuş, tıklama veya tuş basımı kilidi açar. Tarayıcının otomatik
 * oynatma kuralı için gereken "kullanıcı jesti" budur.
 */
export function useAudioUnlock(): void {
  useEffect(() => {
    if (useAppStore.getState().audioUnlocked) return

    const unlock = () => {
      useAppStore.getState().unlockAudio()
      remove()
    }

    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    const remove = () => events.forEach((e) => window.removeEventListener(e, unlock))

    events.forEach((e) => window.addEventListener(e, unlock, { once: true, passive: true }))
    return remove
  }, [])
}
