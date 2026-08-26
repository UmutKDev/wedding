#!/usr/bin/env python3
"""
Paylaşım görsellerini üretir:

  public/og/preview.jpg      1200×630  — WhatsApp / X / Facebook önizlemesi
  public/apple-touch-icon.png  180×180 — iOS "ana ekrana ekle" ikonu

Neden bir script?  Bu görseller siteyle AYNI paletten ve aynı bilgiden
üretilmeli. Elle Canva'da yapılan bir kapak, tarih değiştiğinde sessizce
yanlış kalır. Aşağıdaki değerleri güncelleyip yeniden çalıştırmak yeterli:

    python3 scripts/make-og-image.py

⚠️  İsim/tarih/şehir burada bir kez daha yazılı (src/config/wedding.ts'in
    kopyası). Python'dan TypeScript ayrıştırmak kırılgan olurdu; bunun
    yerine değişiklik gerektiğinde iki yeri de güncelleyin.
"""

from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

# ── İçerik ────────────────────────────────────────────────────────────
EYEBROW = "EVLENİYORUZ"
GROOM = "Ömer"
BRIDE = "Burcu"
AMP = "&"

# Kartta hangi isim üstte duracak.
# ⚠️ index.html'deki `og:site_name` ve vite.config.ts'teki `%OG_TITLE%`
#    ile AYNI sırada olmalı — görsel bir sırayı, altındaki başlık başka
#    bir sırayı gösterirse kart kendi içinde çelişir.
NAME_ORDER = (BRIDE, GROOM)
DATE_LINE = "20 EYLÜL 2026 · PAZAR"
CITY = "GAZİANTEP"
SOURCE_PHOTO = "public/photos/memories/02.jpg"   # kameraya bakan kare

# ── Palet (src/styles/index.css ile aynı) ─────────────────────────────
PAPER = (250, 247, 242)
PAPER_DEEP = (239, 232, 220)
INK = (43, 39, 36)
GOLD = (184, 145, 47)
GOLD_DEEP = (124, 95, 26)

DIDOT = "/System/Library/Fonts/Supplemental/Didot.ttc"
AVENIR = "/System/Library/Fonts/Avenir Next.ttc"


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


def draw_tracked(draw, xy, text, fnt, fill, tracking):
    """Harf aralıklı metin — Pillow'da yerel letter-spacing yok."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking
    return x - tracking


def tracked_width(draw, text, fnt, tracking):
    if not text:
        return 0
    return sum(draw.textlength(c, font=fnt) for c in text) + tracking * (len(text) - 1)


def warm_backdrop(w, h):
    """Merkezi hafif açılan fildişi zemin — sitenin body gradyanının eşi."""
    base = Image.new("RGB", (w, h), PAPER_DEEP)
    glow = Image.new("L", (w, h), 0)
    g = ImageDraw.Draw(glow)
    cx, cy = int(w * 0.62), int(h * 0.42)
    r = int(max(w, h) * 0.72)
    g.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    return Image.composite(Image.new("RGB", (w, h), PAPER), base, glow)


def photo_panel(path, w, h, zoom=1.3, focus_y=0.42):
    """
    Dikey fotoğrafı panele oturt.

    `zoom` sığdırmanın ötesinde yakınlaştırır: WhatsApp önizlemeyi ~300px
    genişlikte gösteriyor, tam boy bir plan orada "iki küçük insan"a
    dönüşüyor. `focus_y` orijinaldeki yüz hizası (0–1); o hiza panelin
    %38'ine getirilir, yani yüzler üst-orta üçlükte durur.
    """
    img = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    scale = max(w / img.width, h / img.height) * zoom
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

    left = max(0, (img.width - w) // 2)
    top = int(focus_y * img.height - h * 0.38)
    top = max(0, min(img.height - h, top))
    return img.crop((left, top, left + w, top + h))


def build_og(out_path):
    W, H = 1200, 630
    PANEL_W = 468

    canvas = warm_backdrop(W, H)
    canvas.paste(photo_panel(SOURCE_PHOTO, PANEL_W, H), (0, 0))

    draw = ImageDraw.Draw(canvas)

    # Fotoğrafla metni ayıran ince altın çizgi
    draw.line([(PANEL_W, 0), (PANEL_W, H)], fill=GOLD, width=2)

    f_eyebrow = font(AVENIR, 22, index=5)      # Medium
    f_name = font(DIDOT, 96)
    f_amp = font(DIDOT, 46, index=1)           # Italic
    f_date = font(AVENIR, 25, index=7)         # Regular
    f_city = font(AVENIR, 21, index=5)

    cx = PANEL_W + (W - PANEL_W) // 2
    y = 96

    tw = tracked_width(draw, EYEBROW, f_eyebrow, 7)
    draw_tracked(draw, (cx - tw / 2, y), EYEBROW, f_eyebrow, GOLD_DEEP, 7)
    y += 62

    for text, fnt, fill, gap in (
        (NAME_ORDER[0], f_name, INK, 108),
        (AMP, f_amp, GOLD, 62),
        (NAME_ORDER[1], f_name, INK, 118),
    ):
        w = draw.textlength(text, font=fnt)
        draw.text((cx - w / 2, y), text, font=fnt, fill=fill)
        y += gap

    draw.line([(cx - 90, y), (cx + 90, y)], fill=GOLD, width=1)
    y += 36

    tw = tracked_width(draw, DATE_LINE, f_date, 3)
    draw_tracked(draw, (cx - tw / 2, y), DATE_LINE, f_date, INK, 3)
    y += 44

    tw = tracked_width(draw, CITY, f_city, 6)
    draw_tracked(draw, (cx - tw / 2, y), CITY, f_city, GOLD_DEEP, 6)

    canvas.save(out_path, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"✓ {out_path}  {W}×{H}")


def build_icon(out_path):
    """iOS ana ekran ikonu — fildişi zeminde altın iki halka."""
    S = 180
    SS = 4  # kenar yumuşatma için büyük çiz, sonra küçült
    img = Image.new("RGB", (S * SS, S * SS), PAPER)
    d = ImageDraw.Draw(img)

    r = int(S * SS * 0.26)
    cy = S * SS // 2
    for dx, width in ((-int(S * SS * 0.11), 9), (int(S * SS * 0.11), 9)):
        cx = S * SS // 2 + dx
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD, width=width * SS // 2)

    img = img.resize((S, S), Image.LANCZOS)
    img.save(out_path, "PNG", optimize=True)
    print(f"✓ {out_path}  {S}×{S}")


if __name__ == "__main__":
    build_og("public/og/preview.jpg")
    build_icon("public/apple-touch-icon.png")
