# Burcu & Ömer — Dijital Düğün Davetiyesi

Tamamen statik, kendi kendine yeten bir React davetiyesi. Backend yok,
veritabanı yok, abonelik yok — `dist/` klasörü herhangi bir statik hosting'e
atılıp çalışır.

**Öne çıkanlar**

- Hero'da tam ekran düğün arabası videosu (dikey kurgu, sessiz döngü)
- Canlı geri sayım, takvime ekleme (.ics + Google), gömülü harita + üç
  navigasyon uygulamasına yol tarifi, oklu fotoğraf slider'ı + tam ekran
  görüntüleyici, paylaşım
- Arka planda GPU altın toz alanı (React Three Fiber)
- Paylaşım kartı: tam Open Graph + Twitter meta seti, görsel script ile
  üretiliyor, adresler `siteUrl`'den mutlak olarak enjekte ediliyor
- Katılım formu yok (istenmedi)
- **Mobil öncelikli** — dört kademeli performans sistemi, güvenli alan
  desteği, hareket azaltma tercihine tam uyum

---

## Başlarken

```bash
npm install
npm run dev
```

Tarayıcı: <http://localhost:5173>

---

## Neyi nereden değiştiririm

| İstediğin                                             | Dosya                                     |
| ----------------------------------------------------- | ----------------------------------------- |
| İsim, tarih, saat, mekân, adres, etkinlikler, anılar… | **`src/config/wedding.ts`**               |
| Arayüzdeki sabit yazılar ("Kaydırın", "Yol Tarifi"…)  | `src/content/tr.ts`                       |
| Renkler, fontlar, boşluk ölçüleri                     | `src/styles/index.css` (`@theme` bloğu)   |
| Bölümlerin sırası veya hangisinin görüneceği          | `src/App.tsx`                             |
| Video ve müzik                                        | `src/media/` → [ASSETS.md](ASSETS.md)     |
| Fotoğraflar                                           | `public/photos/` → [ASSETS.md](ASSETS.md) |
| Paylaşım kartı (WhatsApp önizlemesi)                  | `python3 scripts/make-og-image.py`        |

**Neredeyse her şey `src/config/wedding.ts` içinde.** Bölüm bileşenlerinin
içine sabit metin yazılmadı; bilgi değiştiğinde tek dosyaya dokunulur.

`// TODO` işaretli satırlar örnek veridir — gerçeğiyle değiştirilmeli.

### Etkinlikler

Etkinlikler `events` dizisinde birer kayıt ve "Ne Zaman, Nerede"
bölümünde kart olarak görünüyorlar. Şu an tek kart var (düğün); nikah
veya kına gibi ayrı bir kart isterseniz diziye bir nesne eklemeniz
yeterli — ızgara sütun sayısını kendisi ayarlar (1 kart ortalanır,
2 kart iki sütun, 3+ üç sütun).

Bir etkinlik farklı bir mekândaysa ona `venue: { … }` ekle — kart o zaman
kendi adresini de gösterir. Takvim kaydı her zaman tüm etkinliklerin en
erken başlangıcından en geç bitişine kadar uzanır.

### Bölüm gizleme

Bölümler verisi yoksa kendiliğinden gizlenir:

| Bölüm                | Gizlenme koşulu   |
| -------------------- | ----------------- |
| Anılar               | `gallery: []`     |
| Hikâye filmi / Reel  | video dosyası yok |
| İletişim (kapanışta) | `contact: []`     |

Sayfa şu sırayla akar:
**Hero → Geri Sayım → Ne Zaman/Nerede → Anılar → (varsa filmler) → Kapanış**

"Ne Zaman, Nerede" bölümü hem tarihi/etkinlik kartını hem de mekânı
(gömülü harita + navigasyon) içerir — başlığın sorduğu iki soru da orada
cevaplanıyor, ayrı bir "Mekân" bölümü yok.

---

## Yayına alma

`dist/` klasörü tamamen bağımsızdır.

### Vercel

```bash
npm i -g vercel && vercel
```

`vercel.json` hazır (SPA yönlendirmesi + önbellek başlıkları).

### Netlify

Repoyu bağla ya da `dist/` klasörünü sürükle-bırak. `netlify.toml` hazır.

### Başka bir yer

```bash
npm run build
```

Oluşan `dist/` klasörünü sunucuya kopyala.

> Alan adı **`omer-burcu.vercel.app`** olarak ayarlı
> (`src/config/wedding.ts` → `siteUrl`). Paylaş düğmesi, takvim kaydı ve
> **paylaşım kartının tamamı** bunu kullanıyor: Open Graph mutlak URL
> ister, yanlışsa WhatsApp önizlemesi boş çıkar. Adres değişirse orayı
> güncelle — `npm run build` geçersiz bir adres görürse uyarır.

---

## Tasarım sistemi

```
FONT     Başlık: Cormorant Variable (300)  ·  Gövde: Jost Variable
PALET    Zemin  #FAF7F2   sıcak fildişi
         Kart   #FFFFFF   beyaz + yumuşak gölge
         Metin  #2B2724   kömür grisi     (13.4:1)
         Soluk  #6E655E   ikincil          (5.2:1)
         Etiket #7E746C   küçük dekoratif  (4.3:1)
         Aksan  #B8912F   şampanya altın — DEKORATİF
         Küçük metin altını #7C5F1A        (5.6:1)
```

**İki farklı altın var, bilinçli olarak.** `--color-gold` (#B8912F) fildişi
üzerinde yalnızca 2.7:1 kontrast verir — çizgi, kenarlık ve büyük başlık
için harika ama küçük metin için WCAG'in istediği 4.5:1'in altında. Bölüm
etiketleri gibi küçük metinlerde `--color-gold-deep` kullanılır.

Token isimleri renge değil ROLE göre: `paper`, `ink`, `gold`. Koyu temadan
dönerken `text-ivory`'nin "kömür grisi" anlamına gelmesi kalıcı bir tuzak
olurdu.

---

## Mimari — kısa turu

```
Sabit tam ekran <Canvas>  (z:0)   ← 3B sahne, hiç unmount olmaz
       ↑ üstünde kayar
   DOM bölümleri          (z:10)  ← Hero, geri sayım, hikâye…
       ↑ üstünde
   Kaplamalar             (z:50+) ← film greni, müzik düğmesi, açılış
```

Tek bir kalıcı WebGL bağlamı tüm sayfanın arkasında durur; kamera bölümler
arasında kesintisiz akar. Bölüm başına ayrı canvas açmak hem çok daha
pahalı olurdu hem de geçişler kopuk görünürdü.

**Kaydırma React state'i değildir.** Saniyede 60–120 kez değişen bir değeri
state'e bağlamak her karede yeniden render tetikler. Değerler
`src/store/scroll.ts` içindeki değişebilir nesnede tutulur; 3B sahne onu
`useFrame` içinden okur, DOM tarafı IntersectionObserver kullanır.

### Performans kademeleri

Cihaz otomatik sınıflandırılır (`src/three/perf.ts`); kare hızı düşerse
çalışma anında bir kademe iner.

| Kademe   | Partikül                                         | DPR   |
| -------- | ------------------------------------------------ | ----- |
| `high`   | 12.000                                           | ≤2    |
| `medium` | 5.000                                            | ≤1.75 |
| `low`    | 1.500                                            | ≤1.25 |
| `none`   | WebGL yok / hareket azaltma → sahne hiç kurulmaz |       |

Son işleme zinciri (bloom, vinyet) bilinçli olarak yok: açık temada
bantlanma üretiyordu ve kenar yumuşatmanın (her kademede açık) getirdiği
netlikten daha azını veriyordu.

Test etmek için: `?tier=high`, `?tier=medium`, `?tier=low`, `?tier=none`

---

## Mobil kararlar

Davetiye ağırlıkla telefondan açılacağı için birkaç şey bilinçli olarak
masaüstü alışkanlığının tersine yapıldı:

- **Dokunmatikte yumuşak kaydırma (Lenis) kapalı.** iOS ve Android'in
  kendi momentum fiziği zaten çok iyi; üstüne JS yumuşatma bindirmek
  telefonda gecikmeli hissettiriyor ve sürekli RAF döngüsü pil yiyor.
- **Anılar slider'ı yerel `scroll-snap` üstünde.** Parmakla kaydırma
  iOS/Android'in kendi momentum fiziğini kullanır; sağ/sol oklar aynı
  şeridi programatik olarak kaydırır. Kendi sürükleme mantığımızı
  yazsaydık dokunmatikte yerelin altında kalırdı.
  ⚠️ Ok animasyonu elle tween'lenir: `scrollTo({behavior:'smooth'})`
  `scroll-snap-type: mandatory` ile çakışıp hiç kaydırmıyor.
- **Harita `loading="lazy"` ile gömülü.** Doğrudan görünür (dokunma
  gerektirmez) ama iframe ancak görüş alanına yaklaşınca istek atar;
  açılışta üçüncü tarafa istek gitmez.
- **Videolar `preload="none"`**, görünür olunca yükleniyor.
- **Ses ancak kullanıcı dokunuşundan sonra** başlar (tarayıcı kuralı) ve
  video oynarken otomatik kısılır.
- Fontlar self-hosted; **dış CDN çağrısı yok** (harita hariç, o da isteğe bağlı).

---

## Erişilebilirlik

- `prefers-reduced-motion` açıksa: açılış sekansı atlanır, 3B sahne
  kapanır, tüm animasyonlar durur, içerik tam okunur kalır
- WebGL yoksa veya başlatılamazsa sahne sessizce devre dışı kalır
- Tam klavye navigasyonu, altın odak halkaları, `tap` sınıfıyla 44×44
  minimum dokunma hedefi
- Geri sayım `aria-live` ile sakin bir özet duyurur (saniye saniye değil)
- Harf harf beliren başlıklar ekran okuyucuya tek parça metin olarak gider

---

## Komutlar

```bash
npm run dev        # geliştirme sunucusu
npm run build      # tip kontrolü + üretim derlemesi
npm run preview    # derlenmiş çıktıyı yerelde dene
npm run typecheck  # yalnızca tip kontrolü
```

---

## Diğer belgeler

- **[VIDEO-PROMPTS.md](VIDEO-PROMPTS.md)** — dört video slotu için AI
  prompt'ları (Sora / Veo / Kling / Runway / Luma) + ffmpeg komutları
- **[ASSETS.md](ASSETS.md)** — hangi dosya nereye, hangi ölçüde
