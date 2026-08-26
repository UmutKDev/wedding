# 🎬 Video Üretim Rehberi

Davetiyede **dört ayrı video slotu** var. Hiçbiri zorunlu değil — dosya
koymadığın slot sessizce gizlenir, site sorunsuz çalışır. İstediğin sırayla,
istediğin kadarını üretebilirsin.

Hangi AI aracını kullanacağına henüz karar vermediğin için her slot altında
**beş araca özel prompt** hazır: Sora, Veo, Kling, Runway ve Luma. Prompt'lar
İngilizce — bu araçların hepsi İngilizce girdide belirgin şekilde daha iyi
sonuç veriyor. Üstlerinde Türkçe olarak ne istediğimiz yazıyor.

---

## Önce şunu bil: bu davetiye telefonda açılacak

Misafirlerin neredeyse tamamı linki WhatsApp'tan alıp telefonda açacak.
Bu üç şeyi baştan aklında tut:

1. **Dikey kadraja hazırlan.** 16:9 bir video dikey ekranda kenarlarından
   ağır kırpılır. Ya her yatay video için ayrı bir `-portrait` (9:16)
   varyantı üret, ya da **önemli hiçbir şeyi karenin kenarlarına koyma** —
   merkezdeki dikey şerit her koşulda görünür kalan tek alandır.
2. **Dosya boyutu = misafirin mobil verisi.** Aşağıdaki hedefleri aş.
3. **Yazı koyma.** İsim ve tarih zaten sitenin kendi tipografisiyle,
   videonun üstünde net biçimde yazılıyor. Videonun içine gömülü yazı hem
   çift görünür hem de küçük ekranda okunmaz.
   _(Tek istisna: hero videosundaki araba plakası — o kasıtlı.)_

---

## ⚠️ Ortak görsel dil — AÇIK ve FERAH

Davetiyenin teması **fildişi & şampanya**: neredeyse beyaz zemin, kömürsü
metin, yumuşak altın aksan. Videoların da aynı dünyada olması şart —
koyu, kontrastlı bir video bu sayfanın ortasında kara bir delik gibi durur.

**Her prompt'a şunu ekle:**

```
Bright, airy, high-key lighting. Ivory and cream palette (#FAF7F2), soft
champagne gold accents (#B8912F), warm natural daylight. Low contrast,
lifted shadows, NO crushed blacks, no heavy vignette. Gentle highlights,
overexposed background is fine. Shot on 35mm, shallow depth of field,
fine film grain, elegant slow movement. Light and romantic editorial
wedding film aesthetic.
```

**Ve negatif tarafa:**

```
dark, moody, high contrast, black background, night scene, neon, teal
and orange grade, heavy vignette, crushed blacks
```

> Bunun neden bu kadar vurgulandığını merak edersen: sitenin ilk sürümü
> koyu temalıydı ve prompt'lar "near-black obsidian shadows" diyordu.
> Tema açığa döndüğü için o yönerge şimdi tam tersini üretirdi.

---

# 1️⃣ `hero-loop` — Klasik Araba ⭐

**Nerede:** Ana ekranda, isimlerin ve tarihin arkasında; **sessiz**, sonsuz
döner. Sayfayı açan herkesin gördüğü ilk hareketli görüntü budur.

|             |                                                                         |
| ----------- | ----------------------------------------------------------------------- |
| Dosya       | `src/media/hero-loop.mp4` (+ **`hero-loop-portrait.mp4` — çok önemli**) |
| Oran        | 16:9 + 9:16                                                             |
| Süre        | **8–12 sn**, kusursuz döngü                                             |
| Ses         | **Yok** (sessiz oynatılır)                                              |
| Poster      | `hero-loop.jpg`                                                         |
| Hedef boyut | **< 3 MB** — her ziyarette indirilir                                    |

**Konsept:** Yukarıdan hafif eğik (drone/vinç) bir açıyla, sakin bir yolda
ilerleyen **klasik/vintage bir düğün arabası**. İçinde gelin ve damat.
Arka plakada **Burcu & Ömer** yazıyor. Kamera arabanın hızına eşlik ediyor.

**Kompozisyon uyarıları:**

- Arabayı **karenin ortasında** tut — dikey varyant üretmezsen 16:9 video
  telefonda merkezden kırpılır ve kenardaki araba kadraj dışında kalır.
- Üst üçlük **boş ve açık** kalsın; isimler ve tarih oraya biniyor.
- Plaka kareye **yeterince büyük** girmeli, yoksa okunmaz.

<details>
<summary><b>Sora</b></summary>

```
Aerial shot from slightly above and behind, following a classic vintage
cream-coloured wedding convertible driving slowly along a quiet tree-lined
country road on a bright sunny afternoon. A bride in a white dress and a
groom in a dark suit are visible sitting inside. White satin ribbons tied
to the bonnet and a small ivory floral arrangement. The rear licence plate
is clearly legible and reads exactly "Burcu & Ömer" in bold black capital
letters on a clean white plate, filling a good portion of the frame.
The camera glides smoothly at the same speed as the car, keeping it
centered. Bright airy high-key lighting, ivory and cream palette, warm
natural daylight, low contrast, lifted shadows, no crushed blacks.
35mm, shallow depth of field, fine film grain. Seamless loop — first and
last frame identical. No text overlays. 10 seconds.
```

</details>

<details>
<summary><b>Veo</b></summary>

```
A 10-second seamlessly looping aerial tracking shot. Camera position:
high angle, approximately 30 degrees above and 10 metres behind a classic
vintage cream convertible wedding car. The car drives at a steady slow
speed down an empty tree-lined road in bright afternoon sunlight. Inside,
a bride in white and a groom in a dark suit, seen from behind. White
ribbons on the bonnet, ivory flowers.

CRITICAL DETAIL: the rear licence plate must be sharp, well-lit and
clearly readable, showing exactly the text "Burcu & Ömer" in black
capital letters on a white plate. Keep the plate large in frame.

The car stays centered in the frame at all times; the upper third of the
frame stays open and bright. Colour: ivory and cream, champagne gold
highlights, warm daylight, low contrast, lifted shadows, no crushed
blacks. 35mm, shallow depth of field, fine grain. First and last frame
must match exactly for a perfect loop. No text overlays.
```

</details>

<details>
<summary><b>Kling</b></summary>

```
Prompt: High angle aerial shot following a classic vintage cream wedding
convertible driving slowly on a sunny tree-lined road. Bride in white and
groom in dark suit inside. White ribbons and ivory flowers on the bonnet.
Rear licence plate clearly readable with the text "Burcu & Ömer" in black
capitals on a white plate. Smooth tracking camera at car speed, car
centered, upper third of frame open and bright. Bright airy high-key
lighting, ivory and cream palette, warm daylight, low contrast.
35mm, shallow depth of field, fine film grain. Seamless loop.

Negative prompt: dark, moody, night, high contrast, crushed blacks, heavy
vignette, neon, teal and orange, text overlay, watermark, distorted
letters, gibberish text, blurry licence plate, fast motion, jump cuts
```

</details>

<details>
<summary><b>Runway</b></summary>

Runway'de **Image-to-Video** çok daha iyi sonuç verir. Önce bir kare üret
(Midjourney / DALL·E / Runway Frames) ya da uygun bir stok fotoğraf bul —
plakayı o karede net biçimde ayarla, sonra hareketlendir. Böylece plaka
yazısı üretim boyunca sabit kalır.

**Loop** seçeneğini aç, kamera hareketini **Static** bırak (arabanın kendi
hareketi yeterli) ya da çok hafif bir **Push Out** ver.

```
Classic vintage cream wedding convertible driving slowly along a sunny
tree-lined road, seen from a high angle behind. Bride and groom inside,
white ribbons on the bonnet. Rear licence plate reads "Burcu & Ömer".
Bright airy high-key lighting, ivory and cream palette, warm daylight,
low contrast, lifted shadows. Smooth continuous motion.
```

</details>

<details>
<summary><b>Luma</b></summary>

Luma'da **Loop** modunu aç.

```
Seamless looping aerial shot from slightly above and behind a classic
vintage cream wedding convertible driving on a quiet sunny tree-lined
road. Bride in white and groom in a dark suit inside. White ribbons and
ivory flowers on the bonnet. The rear licence plate clearly reads
"Burcu & Ömer" in black capitals on a white plate. Camera follows at the
same speed, car stays centered. Bright airy ivory and cream palette, warm
daylight, low contrast, no crushed blacks. 35mm, shallow focus, fine grain.
```

</details>

### 🚨 Plaka yazısı — en çok bozulan şey

AI video araçlarının **en zayıf olduğu konu metin üretmek.** "Burcu & Ömer"
büyük ihtimalle ilk denemede "OMFR & BURCU", "ÖMFR 8 BURCLI" gibi bozuk
çıkacak. Buna hazırlıklı ol:

1. **Birkaç deneme yap.** Genelde 3–5 üretimde bir tanesi tutar.
2. **Türkçe "Ö" harfi ekstra risklidir.** Bozuk çıkmaya devam ederse
   prompt'ta `"OMER & BURCU"` (noktasız) dene — okunaklı olması,
   doğru harf olmasından önemli.
3. **En garantili yol: plakayı sonradan ekle.** Video hazır olduğunda
   plakayı düz bir dikdörtgen olarak boyayıp üstüne yazıyı yerleştirmek,
   onlarca kez yeniden üretmekten çok daha hızlıdır. Runway'in
   _Inpainting_ aracı, Photoshop'un video katmanları ya da CapCut'ın
   _tracker_ özelliği bu işi görür.
4. **Alternatif:** Plakayı hiç zorlama, arabanın **arka camına** asılı
   klasik "JUST MARRIED" tabelası iste — AI o kalıbı çok daha iyi biliyor.

### 🔁 Döngü kusursuz olmazsa

Diğer videolarda önerilen **boomerang yöntemini burada KULLANMA** — araba
geri geri gitmeye başlar, komik olur.

Bunun yerine: düz bir yolda, sabit hızda, tekdüze bir arka planla (aynı
ağaç dizisi) çekilmiş bir plan zaten neredeyse kusursuz döner. Küçük bir
sıçrama kalırsa iki uç arasında kısa bir çapraz geçiş yeterli:

```bash
# Son 0.5 saniyeyi başlangıçla yumuşakça karıştır (12 sn'lik video için)
ffmpeg -i hero-loop.mp4 -filter_complex \
  "[0]split[a][b];[a]trim=0:11.5,setpts=PTS-STARTPTS[main];\
   [b]trim=11.5:12,setpts=PTS-STARTPTS,format=yuva420p,fade=out:st=0:d=0.5:alpha=1[end];\
   [main][end]overlay" -an hero-loop-donen.mp4
```

---

# 2️⃣ `intro` — Açılış Filmi

**Nerede:** Misafir "Davetiyeyi Aç" mührüne dokununca tam ekran, **sesli** oynar.

|             |                                                          |
| ----------- | -------------------------------------------------------- |
| Dosya       | `src/media/intro.mp4` (+ opsiyonel `intro-portrait.mp4`) |
| Oran        | 16:9 — dikey varyant önerilir                            |
| Süre        | **15–25 sn**                                             |
| Ses         | Var                                                      |
| Poster      | `intro.jpg`                                              |
| Hedef boyut | < 8 MB                                                   |

**Ne istiyoruz:** Aydınlık, ferah bir açılış. Beyaz güller, tül, gün ışığı,
altın yüzükler. Sonu **açık ve parlak** kapansın — hemen ardından sitenin
fildişi zeminine geçiliyor, geçiş yumuşak olmalı.

<details>
<summary><b>Sora / Veo / Luma</b></summary>

```
A bright, airy cinematic wedding invitation opening, 20 seconds.
Shot 1: extreme close-up of white roses and eucalyptus in soft morning
light, dew on the petals. Shot 2: sheer ivory curtains drifting in a warm
breeze, sunlight streaming through. Shot 3: two gold wedding rings resting
on a cream linen cloth, catching a soft highlight, macro. Shot 4: the
light gently blooms and fills the frame with warm ivory white.
High-key lighting, ivory and cream palette, champagne gold accents, warm
natural daylight, low contrast, lifted shadows, no crushed blacks.
35mm, shallow depth of field, fine film grain, very slow elegant camera
movement. No people, no text, no faces.
```

</details>

<details>
<summary><b>Kling / Runway</b></summary>

```
Prompt: Bright airy wedding opening. White roses in morning light, sheer
ivory curtains in a breeze, two gold rings on cream linen, light blooming
to warm white. High-key, ivory and cream palette, warm daylight, low
contrast, shallow depth of field, film grain, very slow movement.

Negative prompt: dark, night, moody, high contrast, crushed blacks, neon,
people, faces, text, watermark, fast motion
```

</details>

---

# 3️⃣ `story` — Hikâye Filmi

**Nerede:** "Bizden Bir Parça" bölümünde, altın çerçeve içinde. Dokununca
**sesli** oynar. Sayfanın duygusal merkezi.

|             |                       |
| ----------- | --------------------- |
| Dosya       | `src/media/story.mp4` |
| Oran        | 16:9                  |
| Süre        | **30–90 sn**          |
| Ses         | Var                   |
| Poster      | `story.jpg`           |
| Hedef boyut | < 15 MB               |

**Ne istiyoruz:** Burası aslında **sizin gerçek görüntüleriniz için**.
Nişan videosu, dış çekim, telefonla çekilmiş anlar… AI ile üretmek yerine
kendi malzemenizi kurgulamanız çok daha etkili olur — özellikle nişan
fotoğraflarınız zaten Anılar bölümünde duruyorken.

**Kendi görüntüleriniz varsa** yapılacak tek şey renk uyumu — sitenin açık
paletine yaklaştırmak:

```bash
# Aydınlat, kontrastı düşür, hafif sıcaklık ver
ffmpeg -i ham-kurgu.mp4 \
  -vf "eq=brightness=0.04:contrast=0.94:saturation=0.95,\
       colorbalance=rs=.03:gs=.01:bs=-.04:rm=.02:bm=-.03,\
       curves=all='0/0.06 0.5/0.54 1/1'" \
  -c:v libx264 -crf 21 -preset slow -c:a aac -b:a 128k story.mp4
```

`curves` filtresi siyahları hafifçe kaldırır — sitenin "lifted shadows"
görünümünü videoya taşıyan asıl ayar budur.

---

# 4️⃣ `reel` — Dikey Reel

|             |                      |
| ----------- | -------------------- |
| Dosya       | `src/media/reel.mp4` |
| Oran        | **9:16 (dikey)**     |
| Süre        | 15–30 sn             |
| Ses         | Var                  |
| Poster      | `reel.jpg`           |
| Hedef boyut | < 6 MB               |

**Ne istiyoruz:** Instagram reel ritmi — hızlı, ritmik kesmeler, ama yine
aydınlık ve ferah.

<details>
<summary><b>Sora / Veo / Kling</b></summary>

```
Vertical 9:16 wedding reel, 20 seconds. Fast rhythmic cuts between bright
intimate details: champagne pouring in sunlight, white rose petals falling
against a bright sky, a white dress hem swirling on a sunlit floor,
confetti in the air, gold rings catching daylight, sheer curtains billowing.
Every shot vertically composed with the subject centered. Energetic pacing,
cuts on the beat. High-key lighting, ivory and cream palette, champagne
gold accents, warm daylight, low contrast, no crushed blacks. Film grain,
light editorial wedding aesthetic. No faces, no text.
```

</details>

---

# 🛠 Üretim sonrası: sıkıştırma ve dönüştürme

AI araçları genelde büyük dosya verir. Siteye koymadan önce mutlaka sıkıştır.
`ffmpeg` yoksa: `brew install ffmpeg`

### MP4 (herkes için — zorunlu)

```bash
ffmpeg -i ham.mp4 -c:v libx264 -profile:v high -crf 24 -preset slow \
  -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k intro.mp4
```

- `-crf 24` kalite/boyut dengesi. Büyük geldiyse 26–28 dene.
- `-movflags +faststart` **kritik**: dosyanın oynatma bilgisini başa taşır,
  video tamamen inmeden oynamaya başlar. Bu olmadan mobilde uzun bir bekleme olur.
- `-pix_fmt yuv420p` eski Android cihazlarda uyumluluk için.

### WebM (opsiyonel — %30 daha küçük, varsa önce o sunulur)

```bash
ffmpeg -i ham.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 \
  -c:a libopus -b:a 96k intro.webm
```

### Sessiz hâle getir (hero-loop için zorunlu)

```bash
ffmpeg -i hero-loop.mp4 -c:v copy -an hero-loop-sessiz.mp4
```

### Poster karesi çıkar

```bash
ffmpeg -i intro.mp4 -ss 00:00:02 -vframes 1 -q:v 3 intro.jpg
```

### Yatay videodan dikey varyant (merkezden kırp)

Ayrı bir dikey çekim üretemediysen, hiç yoktan iyidir:

```bash
ffmpeg -i hero-loop.mp4 -vf "crop=ih*9/16:ih" -c:a copy hero-loop-portrait.mp4
```

### Boyutu kontrol et

```bash
ls -lh src/media/
```

| Slot        | Hedef   |
| ----------- | ------- |
| `hero-loop` | < 3 MB  |
| `intro`     | < 8 MB  |
| `reel`      | < 6 MB  |
| `story`     | < 15 MB |

---

# 🎵 Müzik

`src/media/ambient.mp3` — davetiye açıldıktan sonra kısık sesle çalar,
sağ alttaki düğmeyle kapatılabilir, video oynarken otomatik kısılır.

```bash
# 128 kbps, mono — davetiye için fazlasıyla yeterli, dosya küçük kalır
ffmpeg -i sarki.wav -c:a libmp3lame -b:a 128k -ac 1 ambient.mp3
```

⚠️ **Telif:** Popüler bir şarkıyı siteye koymak teknik olarak çalışır ama
telif ihlalidir. Telifsiz kaynaklar: [Pixabay Music](https://pixabay.com/music/),
[Uppbeat](https://uppbeat.io), [Epidemic Sound](https://www.epidemicsound.com) (ücretli).
Arama önerisi: _"romantic cinematic piano"_, _"light acoustic wedding"_.

---

# ✅ Dosyaları koyduktan sonra

1. Dosyaları **tam olarak bu isimlerle** `src/media/` klasörüne bırak.
2. `npm run dev` — konsolda hangi medyanın hâlâ eksik olduğu yazar.
3. Kod tarafında **hiçbir ayar yapmana gerek yok**; slot kendiliğinden açılır.
