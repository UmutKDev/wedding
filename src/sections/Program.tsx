import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import { wedding, type ProgramStep } from '../config/wedding'
import { tr } from '../content/tr'

/**
 * Gecenin akışı.
 *
 * 📱 Saat solda sabit genişlikte bir sütun, açıklama sağda. Bu düzen dar
 * ekranda da bozulmaz ve göz saatleri tek bir dikey eksende tarayabilir.
 */
export function Program() {
  if (wedding.program.length === 0) return null

  return (
    <SectionShell id="program" eyebrow={tr.program.eyebrow} title={tr.program.title}>
      <ol className="flex flex-col">
        {wedding.program.map((step, i) => (
          <Reveal key={`${step.time}-${step.title}`} delay={i * 0.06}>
            <li className="relative flex gap-4 pb-8 sm:gap-6">
              {/*
                Bağlantı çizgisi mutlak konumlu ve satırın TAMAMINI kapsar.
                Akış içinde `flex-1` olarak bırakıldığında yalnızca içerik
                yüksekliği kadar uzuyordu; açıklaması olmayan adımlarda
                (tek satırlık "İlk Dans", "Pasta") çizgi görünmez oluyor ve
                zaman çizelgesi ortadan kopuyordu.
              */}
              {i < wedding.program.length - 1 && (
                <span
                  className="absolute top-7 bottom-0 left-[1.875rem] w-px sm:left-[2.25rem]"
                  style={{
                    background:
                      'linear-gradient(180deg, color-mix(in oklab, var(--color-gold) 34%, transparent), color-mix(in oklab, var(--color-gold) 8%, transparent))',
                  }}
                  aria-hidden="true"
                />
              )}

              <div className="w-[3.75rem] shrink-0 text-center sm:w-[4.5rem]">
                <time className="text-gold-plain font-display text-[1.125rem] leading-none tracking-[0.04em]">
                  {step.time}
                </time>
              </div>

              <div className="flex flex-1 gap-3 pt-0.5">
                <StepIcon icon={step.icon} />
                <div className="flex flex-col gap-1">
                  <h3 className="text-ink font-display text-[1.25rem] leading-tight">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-ink-dim text-[0.875rem] leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </SectionShell>
  )
}

/** Program adımının yanındaki ince altın ikon */
function StepIcon({ icon }: { icon?: ProgramStep['icon'] }) {
  const paths: Record<NonNullable<ProgramStep['icon']>, string> = {
    rings: 'M8 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm-1.5 0a4.5 4.5 0 1 0-4.5 0',
    glass: 'M6 3h9l-1 6a3.5 3.5 0 0 1-7 0L6 3Zm4.5 9.5V19M7 19h7',
    plate: 'M4 12a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0Zm3.6 0a3.9 3.9 0 1 0 7.8 0 3.9 3.9 0 0 0-7.8 0Z',
    dance: 'M9 4.5a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0ZM10.5 8v5m0 0l-3 6m3-6l3.5 5M6 10l4.5-2 5 1.5',
    music: 'M8 17V5.5l9-2v11M8 17a2.2 2.2 0 1 1-4.4 0A2.2 2.2 0 0 1 8 17Zm9-2a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0Z',
    camera: 'M3 7.5h3l1.5-2.5h6L15 7.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 18.5H3A1.5 1.5 0 0 1 1.5 17V9A1.5 1.5 0 0 1 3 7.5Zm7.5 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    heart: 'M10.5 18S3 13.4 3 8.6A3.8 3.8 0 0 1 10.5 7 3.8 3.8 0 0 1 18 8.6C18 13.4 10.5 18 10.5 18Z',
    cake: 'M3.5 19h14v-6a2 2 0 0 0-2-2h-10a2 2 0 0 0-2 2v6Zm3-8V8m4 3V8m4 3V8M4 15c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4 0',
  }

  const d = icon ? paths[icon] : paths.heart

  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      className="mt-0.5 shrink-0"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="var(--color-gold)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  )
}
