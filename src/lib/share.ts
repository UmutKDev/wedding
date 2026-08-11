import { copyText } from './maps'

export type ShareResult = 'shared' | 'copied' | 'failed'

export interface SharePayload {
  title: string
  text: string
  url: string
}

/**
 * Davetiyeyi paylaş.
 *
 * Mobilde yerel paylaşım sayfasını açar (WhatsApp, Mesajlar, Instagram…).
 * Web Share API yoksa — masaüstü tarayıcılar, bazı uygulama içi
 * tarayıcılar — bağlantıyı panoya kopyalar.
 *
 * Not: `navigator.share` yalnızca kullanıcı hareketiyle (tıklama) çağrılabilir.
 */
export const shareInvitation = async (payload: SharePayload): Promise<ShareResult> => {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload)
      return 'shared'
    } catch (err) {
      // Kullanıcı paylaşım sayfasını kapattı — hata değil, sessizce çık.
      if (err instanceof DOMException && err.name === 'AbortError') return 'failed'
      // Diğer hatalarda kopyalamaya düş.
    }
  }

  return (await copyText(payload.url)) ? 'copied' : 'failed'
}

/** WhatsApp'ta doğrudan paylaşım bağlantısı (yedek yol). */
export const whatsappUrl = (text: string, url: string): string =>
  `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
