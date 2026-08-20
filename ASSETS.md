# 📁 Dosyalar Nereye Konur

İki farklı klasör var ve aralarındaki fark bilinçli:

| Klasör | Ne için | Neden burada |
|---|---|---|
| `src/media/` | Video ve müzik | **Varlığı bölümü açar/kapatır.** Build sırasında otomatik taranır; dosya varsa bölüm görünür, yoksa gizlenir. Kod tarafında ayar yok. |
| `public/photos/` | Fotoğraflar | **Metin de gerekir** (alt yazısı, açıklaması, sırası). Zaten config'e yazacağınız için yolu da orada belirtiyorsunuz. |

---

## 🎬 `src/media/` — video ve müzik

Dosyayı doğru isimle bırak, gerisi kendiliğinden olur.

| Dosya | Slot | Oran | Zorunlu? |
|---|---|---|---|
| `intro.mp4` | Açılış filmi | 16:9 | — |
| `intro-portrait.mp4` | Açılışın dikey kurgusu | 9:16 | opsiyonel |
| `intro.jpg` | Açılış poster karesi | 16:9 | önerilir |
| `hero-loop.mp4` | Hero arka planı (sessiz) | 16:9 | — |
| `hero-loop-portrait.mp4` | Hero'nun dikey kurgusu | 9:16 | **önerilir** |
| `hero-loop.jpg` | Hero poster karesi | 16:9 | önerilir |
| `story.mp4` | "Bizden Bir Parça" filmi | 16:9 | — |
| `story.jpg` | Hikâye poster karesi | 16:9 | önerilir |
| `reel.mp4` | Dikey reel | 9:16 | — |
| `reel.jpg` | Reel poster karesi | 9:16 | önerilir |
| `ambient.mp3` | Arka plan müziği | — | — |

Her video için `.webm` varyantı da koyabilirsin (`intro.webm` gibi) —
varsa tarayıcıya önce o sunulur, %30 kadar küçüktür.

👉 Nasıl üretilir, hangi AI prompt'u, hangi ffmpeg komutu →
**[VIDEO-PROMPTS.md](VIDEO-PROMPTS.md)**

---

## 📷 `public/photos/` — fotoğraflar

```
public/photos/
└─ memories/   ← "Anılar" slider'ındaki fotoğraflar
```

Şu an iki nişan fotoğrafı ekli (`01.jpg`, `02.jpg`) ve web için
küçültülmüş durumda. Orijinalleri `photos-original/` klasöründe duruyor —
o klasör `.gitignore`'da ve siteye dahil edilmiyor.

Yeni fotoğraf eklemek için dosyayı bu klasöre koyup `gallery` dizisine bir
satır ekle; slider ok ve nokta sayısını kendisi ayarlar. Dosya bulunamazsa
kırık görsel ikonu değil, zarif bir yer tutucu görünür.

Fotoğrafı klasöre koy, sonra `src/config/wedding.ts` içinde yolunu yaz:

```ts
gallery: [
  { src: '/photos/memories/01.jpg', alt: 'Ömer ve Burcu nişan pastalarını keserken', caption: 'Nişanımız' },
  { src: '/photos/memories/02.jpg', alt: 'Ömer ve Burcu birbirlerine pasta yedirirken', caption: 'Nişanımız' },
]
```

> `alt` metnini boş geçme. Ekran okuyucu kullanan bir misafir varsa
> fotoğrafın ne olduğunu ancak oradan öğrenir.

### Fotoğraf hazırlama

Telefondan çıkan bir fotoğraf 4–8 MB'dir. Galeride 20 tane olduğunu düşün:
misafirin 100 MB veri harcaması gerekir. Mutlaka küçült.

```bash
# macOS'ta yerleşik `sips` — ffmpeg gerekmez.
# Uzun kenarı 1600 piksele indirir, EXIF yönelimini korur.
for f in public/photos/memories/*.jpg; do
  sips -Z 1600 -s formatOptions 82 "$f" --out "$f"
done
```

> Telefondan çıkan bir fotoğraf 3–8 MB olabilir. Mevcut iki fotoğraf bu
> komutla 4.1 MB'tan 839 KB'a indi — mobil veride ciddi fark.

| Kullanım | Önerilen boyut | Hedef dosya |
|---|---|---|
| Anılar | 1600px uzun kenar | < 500 KB |
| Paylaşım görseli (`og/preview.jpg`) | tam 1200×630 | < 400 KB |

---

## 🔗 Paylaşım kartı (WhatsApp / iMessage / X önizlemesi)

Bu görseller **script ile üretiliyor**, elle hazırlanmıyor:

```bash
python3 scripts/make-og-image.py
```

Üretilenler:

| Dosya | Boyut | Nerede kullanılır |
|---|---|---|
| `public/og/preview.jpg` | 1200×630 | Link önizlemesi |
| `public/apple-touch-icon.png` | 180×180 | iOS "ana ekrana ekle" |

Script sitenin paletini ve fontlarını taklit eder: solda çiftin fotoğrafı,
sağda fildişi panelde isimler, tarih ve şehir. İsim veya tarih değişirse
script'in başındaki değerleri güncelleyip yeniden çalıştır.

### ⚠️ `siteUrl` doğru olmalı

Open Graph **mutlak URL** ister. Etiketler build sırasında
`src/config/wedding.ts` içindeki `siteUrl`'den üretilir; orası yanlışsa
WhatsApp görseli çekemez ve önizleme **tamamen boş** çıkar — üstelik
etiketler doğru göründüğü için sebebi anlaşılmaz.

Şu an ayarlı: **`https://omer-burcu.umutk.me`**. Alan adı değişirse
`src/config/wedding.ts` içinden güncelle — `npm run build` adresin
herkese açık bir HTTPS adresi olup olmadığını denetler ve değilse uyarır.

### Önizleme eskiyse

WhatsApp ve Facebook kartları agresif önbelleğe alır. Görsel URL'sine
içerikten türetilen bir damga ekleniyor (`?v=c6de5515`), yani görseli
değiştirip yeniden derlediğinde adres de değişir ve önizleme tazelenir.
Zorla yenilemek için:
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

## 🎨 `public/favicon.svg`

Fildişi zeminde altın iki halka; hazır geliyor. Tarayıcı sekmesinde görünür.

---

## ✅ Kontrol listesi

```bash
npm run dev
```

Konsolda eksik medyanın listesi yazar. Hepsi tamamlandığında o uyarı kaybolur.

- [ ] `src/config/wedding.ts` içindeki bütün `// TODO` satırları gerçek bilgiyle değişti
- [ ] Nikah / düğün / kına saatleri doğru (mekân ve koordinat girildi)
- [ ] `siteUrl` deploy sonrası gerçek adresle güncellendi
- [ ] Videolar `src/media/` içinde ve boyut hedeflerinin altında
- [ ] Fotoğraflar WebP'ye çevrildi ve `alt` metinleri yazıldı
- [ ] `public/og/preview.jpg` eklendi (WhatsApp önizlemesi)
- [ ] Müzik telifsiz bir kaynaktan
