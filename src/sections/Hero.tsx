import { motion, useReducedMotion } from "motion/react";

import { BackgroundVideo } from "../components/BackgroundVideo";
import { media } from "../config/media";
import { coupleOrder, wedding } from "../config/wedding";
import { tr } from "../content/tr";
import { formatFullDate } from "../lib/format";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Açılış ekranı.
 *
 * 📱 Dikey kompozisyon: 3B yüzükler kameranın kadrajlamasıyla üst üçlüğe
 * oturur, isimler alt yarıda durur. İsimler alt alta dizilir — hem klasik
 * davetiye düzeni budur hem de dar ekranda "Burcu & Ömer" tek satırda
 * sıkışmak zorunda kalmaz.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const [firstName, secondName] = coupleOrder;

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26, filter: "blur(10px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  /*
   * 📐 KADRAJ KARARI
   *
   * Hero videosu (yolda giden düğün arabası) kendi içinde net bir
   * kompozisyona sahip: üst yarı boş yol ve ağaçlar, alt yarı araba —
   * ve arabanın plakasında zaten "Burcu & Ömer" yazıyor.
   *
   * Metin bu yüzden ÜSTTE. Aşağıda dururken tam plakanın üstüne biniyor
   * ve videonun en güzel detayını, aynı kelimelerle kapatıyordu. Üstte
   * ise boş yola oturuyor, araba ve plaka tamamen açıkta kalıyor.
   */
  const hasVideo = media.heroLoop.enabled;

  return (
    <section
      id="hero"
      className={`relative flex min-h-dvh flex-col overflow-hidden ${
        hasVideo ? "justify-start" : "justify-end"
      }`}
    >
      {/*
        Perde `BackgroundVideo` içinde değil burada: yön videonun
        varlığına göre değişiyor ve iki katman aynı gradyanı iki kez
        uygulamasın diye orada 0'a çekiliyor.

        `objectPosition` sağ-alta yaslanmış AI filigranını kadraj dışına
        itiyor. `object-fit: cover` sığmayan kısmı zaten kırpıyor; bu
        değer hangi kısmın kırpılacağını seçiyor:
          • dikey ekranda kırpma yatay  → %30 ile sağdan kırpar
          • yatay ekranda kırpma dikey  → %38 ile alttan kırpar
        Her iki yönelimde de filigranın bulunduğu köşe gidiyor, araba
        ise merkeze yakın kaldığı için kompozisyon bozulmuyor.
      */}
      <BackgroundVideo
        slot={media.heroLoop}
        scrim={0}
        objectPosition="30% 38%"
        className="z-0"
      />

      {/*
        Metin perdesi — açık temada KARARTMAZ, fildişine doğru yıkar.

        Perde metin bloğunun TAMAMINI kapsayacak kadar uzun (%72) ve alt
        ucuna kadar taşıyıcı: daha kısa ve daha hızlı sönen bir perdede
        tarih satırı yolun orta tonlu asfaltına denk gelip okunmuyordu.
        Videonun kendisi hâlâ soluklaşmıyor çünkü yoğunluk aşağı doğru
        kademeli iniyor.
      */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-10 h-[72%] ${
          hasVideo ? "top-0" : "bottom-0"
        }`}
        style={{
          background: hasVideo
            ? "linear-gradient(180deg, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.9) 38%, rgba(250,247,242,0.66) 62%, rgba(250,247,242,0) 100%)"
            : "linear-gradient(180deg, rgba(250,247,242,0) 0%, rgba(250,247,242,0.78) 42%, rgba(250,247,242,0.96) 100%)",
        }}
      />

      <div
        className="section-x relative z-20 flex flex-col items-center gap-5 text-center sm:gap-7"
        style={
          hasVideo
            ? { paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }
            : // Kaydırma ipucuna (yaklaşık 4rem) ve cihazın güvenli
              // alanına yer bırakır.
              { paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }
        }
      >
        <motion.p className="eyebrow" {...rise(0.15)}>
          {tr.hero.eyebrow}
        </motion.p>

        <h1 className="flex flex-col items-center leading-none">
          <motion.span
            className="text-foil text-hero font-display block tracking-[0.03em]"
            {...rise(0.3)}
          >
            {firstName.first}
          </motion.span>

          <motion.span
            className="text-gold-plain font-display my-1 block text-[clamp(1.5rem,7vw,3rem)] italic opacity-80 sm:my-2"
            {...rise(0.45)}
            aria-hidden="true"
          >
            {tr.hero.and}
          </motion.span>

          <motion.span
            className="text-foil text-hero font-display block tracking-[0.03em]"
            {...rise(0.6)}
          >
            {secondName.first}
          </motion.span>
        </h1>

        <motion.div className="rule-gold w-32 sm:w-44" {...rise(0.8)} />

        {/*
          Tarih ve şehir videonun üstünde duruyor; perdenin altındaki kare
          her an değişiyor. Açık renkli bir hâle (text-shadow) koyu metnin
          arkasına ince bir fildişi yastık koyar — hangi kare gelirse
          gelsin okunur kalır. Perde tek başına buna yetmiyordu.
        */}
        <motion.div
          className="flex flex-col items-center gap-1.5"
          style={{
            textShadow:
              "0 1px 14px rgba(250,247,242,0.95), 0 0 4px rgba(250,247,242,0.9)",
          }}
          {...rise(0.95)}
        >
          <p className="text-ink text-lead font-display tracking-[0.14em]">
            {formatFullDate(wedding.countdownTarget)}
          </p>
          <p className="text-ink-dim text-eyebrow tracking-[0.24em] uppercase">
            {wedding.venue.city}
          </p>
        </motion.div>
      </div>

      {/*
        Alt perde — yalnızca video varken. Kaydırma ipucu videonun yol
        kısmının üstüne düşüyor ve orta tonlu asfaltta kaybolmuştu; bu
        ince fildişi geçiş onu her karede okunur tutuyor. Video yokken
        zaten fildişi zemin var, gerek kalmıyor.
      */}
      {hasVideo && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[22%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(250,247,242,0.9) 0%, rgba(250,247,242,0.45) 45%, rgba(250,247,242,0) 100%)",
          }}
        />
      )}

      <ScrollHint />
    </section>
  );
}

/** Aşağı kaydırma ipucu — dokunmatikte "Kaydırın", altın ince ok. */
function ScrollHint() {
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center"
      style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-ink-faint text-[0.625rem] tracking-[0.3em] uppercase">
          {tr.hero.scroll}
        </span>
        <svg
          width="12"
          height="26"
          viewBox="0 0 12 26"
          fill="none"
          aria-hidden="true"
          style={
            reduced
              ? undefined
              : { animation: "drift-down 2.4s var(--ease-velvet) infinite" }
          }
        >
          <path
            d="M6 0v22M1 17l5 5 5-5"
            stroke="var(--color-gold)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}
