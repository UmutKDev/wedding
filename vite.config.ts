import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { coupleOrder, wedding } from "./src/config/wedding";

/**
 * Paylaşım (Open Graph) meta etiketlerini `src/config/wedding.ts`'ten üretir.
 *
 * ⚠️ NEDEN BİR EKLENTİ GEREKİYOR
 *
 * Open Graph MUTLAK URL ister. `og:image` içine `/og/preview.jpg` yazmak
 * hiçbir şey göstermez: WhatsApp, Facebook, iMessage ve X göreli yolu
 * çözemez, önizleme tamamen boş çıkar. Statik bir sitede mutlak adresi
 * yazabilmenin tek yolu build sırasında enjekte etmek.
 *
 * Aynı yerden başlık, açıklama ve tarih de gelir — böylece tarih
 * değiştiğinde `index.html` sessizce eskimez.
 *
 * Görsel URL'sine içerikten türetilen bir sürüm damgası eklenir
 * (`?v=abc12345`). WhatsApp önizlemeleri agresif önbelleğe alır; damga
 * olmadan kapak görselini değiştirseniz bile eski hâli görünmeye devam
 * eder. Dosya değişince damga da değişir ve önizleme tazelenir.
 */
function socialMeta(): Plugin {
  return {
    name: "wedding-social-meta",
    transformIndexHtml(html) {
      const site = wedding.siteUrl.replace(/\/+$/, "");

      /*
       * `siteUrl` taşıyıcı bir değer: yanlışsa paylaşım kartı sessizce
       * hiç görünmez ve sebebini anlamak zordur — etiketler "doğru"
       * görünür, yalnızca adres yanlıştır. Bu yüzden build sırasında
       * denetlenir.
       *
       * Kontrol belirli bir yer tutucu metne değil, adresin kendisine
       * bakar: önizleme botları yalnızca herkese açık HTTPS adreslerinden
       * görsel çeker.
       */
      if (
        !/^https:\/\/[^/\s]+\.[^/\s]+$/.test(site) ||
        /localhost|127\.0\.0\.1|example\./.test(site)
      ) {
        this.warn(
          `siteUrl paylaşım kartı için uygun görünmüyor: "${site}". ` +
            "Herkese açık bir HTTPS adresi olmalı (ör. https://omer-burcu.vercel.app). " +
            "Aksi hâlde WhatsApp/X önizlemesi boş çıkar.",
        );
      }

      let stamp = "";
      try {
        const bytes = readFileSync("public/og/preview.jpg");
        stamp =
          "?v=" + createHash("sha256").update(bytes).digest("hex").slice(0, 8);
      } catch {
        // Görsel henüz eklenmemiş — etiketler yine de geçerli kalsın.
      }

      const date = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(wedding.countdownTarget));

      // Sıra `couple.order`'dan gelir; kapak görseli ve `og:site_name`
      // de aynı sırayı gösterir (bkz. wedding.ts → coupleOrder).
      const [a, b] = coupleOrder;
      const couple = `${a.first} & ${b.first}`;

      const values: Record<string, string> = {
        "%OG_URL%": `${site}/`,
        "%OG_IMAGE%": `${site}/og/preview.jpg${stamp}`,
        "%OG_TITLE%": `${couple} — Evleniyoruz`,
        "%OG_DESC%":
          `${date} · ${wedding.venue.city}. ` +
          `${a.first} ${a.last} ve ${b.first} ${b.last}'in düğününe davetlisiniz.`,
        "%OG_ALT%": `${couple} — ${date} tarihli düğün davetiyesi`,
      };

      return html.replace(/%OG_[A-Z]+%/g, (key) => values[key] ?? key);
    },
  };
}

export default defineConfig({
  // Vercel / Netlify kök dizinde yayınlar.
  base: "/",
  plugins: [react(), tailwindcss(), socialMeta()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    cssTarget: "safari16",
    assetsInlineLimit: 2048,
    // Ağır 3B paketi ön yüklemeden çıkar. `modulepreload` yüksek öncelikli
    // indirir ve ilk saniyelerde fontlarla yarışır; oysa sahneye ancak
    // yükleme ekranı bittikten sonra ihtiyaç var.
    modulePreload: {
      resolveDependencies: (_url: string, deps: string[]) =>
        deps.filter((dep) => !dep.includes("three-")),
    },
    rollupOptions: {
      output: {
        // three + drei ayrı chunk: açılış ekranı görünürken arka planda
        // yüklenir, ilk boyamayı bloklamaz.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (/[\\/](three|@react-three)[\\/]/.test(id)) return "three";
        },
      },
    },
  },
  server: {
    host: true,
  },
});
