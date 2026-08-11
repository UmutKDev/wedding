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
├─ story/      ← hikâye zaman tünelindeki fotoğraflar
└─ memories/   ← "Anılar" bölümündeki fotoğraflar
```

### ⭐ Şu an beklenen iki dosya

`src/config/wedding.ts` bu iki yolu bekliyor:

```
public/photos/memories/01.jpg    ← nişan pastasını keserken
public/photos/memories/02.jpg    ← birbirinize pasta yedirirken
```

Dosyalar gelene kadar Anılar bölümü kırık görsel ikonu değil, zarif bir
altın çerçeveli yer tutucu gösterir — site bozuk görünmez.

Fotoğrafı klasöre koy, sonra `src/config/wedding.ts` içinde yolunu yaz:

```ts
story: [
  {
    when: '2019',
    title: 'Tanıştık',
    body: '…',
    photo: '/photos/story/01-tanisma.webp',   // ← buraya
    alt: 'Ömer ve Burcu ilk kez birlikte',    // ← görme engelli misafirler için
  },
]

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
# Tek tek — WebP, uzun kenar 1600px, kalite 82
cd public/photos/memories
for f in *.jpg *.jpeg *.png; do
  ffmpeg -i "$f" -vf "scale='min(1600,iw)':-2" -q:v 82 "${f%.*}.webp"
done
```

macOS'ta ffmpeg yoksa **Önizleme → Araçlar → Boyutu Ayarla** ile de olur;
uzun kenarı 1600 piksele indirmen yeterli.

| Kullanım | Önerilen boyut | Hedef dosya |
|---|---|---|
| Anılar | 1600px uzun kenar | < 300 KB |
| Hikâye tüneli | 1200px uzun kenar | < 200 KB |
| Paylaşım görseli (`og/preview.jpg`) | tam 1200×630 | < 400 KB |

---

## 🔗 `public/og/preview.jpg` — WhatsApp önizlemesi

Link WhatsApp'ta paylaşıldığında görünen kapak görseli. **Tam 1200×630 px**
olmalı, aksi hâlde kırpılır.

En iyi sonuç: fildişi zeminde, ortada "Ömer & Burcu" ve tarih. Bunu Canva'da
5 dakikada yapabilirsin ya da siteyi masaüstünde açıp hero ekranının
ekran görüntüsünü alıp 1200×630'a kırpabilirsin.

Dosya yoksa link önizlemesi görselsiz görünür — site çalışmaya devam eder.

---

## 🎨 `public/favicon.svg` ve `apple-touch-icon.png`

`favicon.svg` hazır geliyor (fildişi zeminde altın iki halka). Değiştirmek istersen
`apple-touch-icon.png` de ekleyebilirsin — **180×180 px**, iOS'ta ana
ekrana eklendiğinde kullanılır.

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
