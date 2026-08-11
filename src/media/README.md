# `src/media/` — video ve müzik dosyaları buraya

Bu klasöre doğru isimle dosya bırakmanız yeterlidir. Kod tarafında hiçbir
ayar yapmanıza gerek yok — build sırasında otomatik bulunur ve ilgili bölüm
kendiliğinden açılır. Dosya yoksa bölüm gizlenir veya poster fallback'ine düşer.

## 📱 Önce mobil

Davetiye ağırlıkla telefondan açılacak. Yatay (16:9) bir video dikey ekranda
kenarlarından ağır kırpılır — bu yüzden her yatay videonun **isteğe bağlı
dikey varyantı** olabilir. Varsa telefonda o oynatılır.

| Dosya adı | Ne için | Oran | Ses | Zorunlu? |
|---|---|---|---|---|
| `intro.mp4` / `.webm` | Zarf açılınca oynayan açılış filmi | 16:9 | var | — |
| `intro-portrait.mp4` | Aynı filmin dikey kurgusu | 9:16 | var | opsiyonel |
| `intro.jpg` | Açılış filmi poster karesi | 16:9 | — | önerilir |
| `hero-loop.mp4` / `.webm` | Hero arka planında sonsuz dönen doku | 16:9 | **yok** | — |
| `hero-loop-portrait.mp4` | Hero'nun dikey kurgusu | 9:16 | yok | **önerilir** |
| `hero-loop.jpg` | Hero poster karesi | 16:9 | — | önerilir |
| `story.mp4` / `.webm` | "Hikâyemiz" bölümündeki film | 16:9 | var | — |
| `story.jpg` | Hikâye filmi poster karesi | 16:9 | — | önerilir |
| `reel.mp4` / `.webm` | Dikey reel bölümü | 9:16 | var | — |
| `reel.jpg` | Reel poster karesi | 9:16 | — | önerilir |
| `ambient.mp3` | Arka plan müziği | — | — | — |

`-portrait` varyantı yoksa 16:9 video merkezden kırpılarak gösterilir; bu
yüzden **önemli hiçbir şeyi karenin kenarlarına koymayın**.

`.webm` isteğe bağlıdır; varsa tarayıcıya önce o sunulur (daha küçük dosya,
mobil veride fark eder).

## Dosya boyutu hedefleri (mobil veri)

| Slot | Hedef |
|---|---|
| `hero-loop` | < 3 MB — her ziyarette yüklenir |
| `intro` | < 8 MB |
| `story` | < 15 MB |
| `reel` | < 6 MB |
| `ambient.mp3` | < 2 MB (128 kbps mono yeterli) |

---

Videoları nasıl üreteceğiniz, hangi AI prompt'unu kullanacağınız ve ffmpeg
sıkıştırma komutları için → **`../../VIDEO-PROMPTS.md`**

Fotoğraflar buraya değil, `public/photos/` altına gider → **`../../ASSETS.md`**
