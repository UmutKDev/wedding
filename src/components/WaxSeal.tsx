import { useReducedMotion } from 'motion/react'

interface WaxSealProps {
  size?: number
  className?: string
}

/**
 * Altın mum mührü.
 *
 * Tasarım notu: kusursuz bir daire ve parlak radyal gradyan, mum yerine
 * plastik bir top gibi durur. Gerçek mühürde üç şey vardır:
 *   1) düzensiz kenar — sıcak mum bastırılınca kusursuz yayılmaz,
 *   2) mat, antika bir altın — cilalı sarı değil,
 *   3) kabartma amblem — gölgesi yukarıda, parlaması aşağıda (letterpress).
 *
 * Düzensiz kenar için asimetrik `border-radius` kullanılıyor; SVG blob
 * yolu yazmadan aynı organik siluet elde ediliyor.
 */
export function WaxSeal({ size = 76, className = '' }: WaxSealProps) {
  const reduced = useReducedMotion()

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Sıcak hale — mührün etrafına vuran ışık */}
      {!reduced && (
        <span
          className="absolute rounded-full"
          style={{
            inset: -size * 0.32,
            background: 'radial-gradient(circle, rgba(201,162,39,0.34) 0%, transparent 66%)',
            animation: 'breathe 3.6s var(--ease-velvet) infinite',
          }}
        />
      )}

      {/* Mumun taban tabakası — biraz taşmış, daha koyu */}
      <span
        className="absolute"
        style={{
          inset: -size * 0.045,
          borderRadius: '47% 53% 51% 49% / 52% 48% 52% 48%',
          background: 'linear-gradient(150deg, #A0803A 0%, #6E5620 100%)',
          opacity: 0.85,
          transform: 'rotate(-8deg)',
        }}
      />

      {/* Mührün gövdesi */}
      <span
        className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.04] group-active:scale-95"
        style={{
          width: size,
          height: size,
          borderRadius: '51% 49% 48% 52% / 49% 53% 47% 51%',
          background:
            'radial-gradient(112% 96% at 36% 26%, #EBD285 0%, #D0A93F 38%, #B08A2C 70%, #86671B 100%)',
          boxShadow: [
            'inset 0 2px 5px rgba(255,245,215,0.5)',
            'inset 0 -4px 10px rgba(74,56,16,0.4)',
            '0 8px 22px rgba(43,39,36,0.28)',
          ].join(', '),
          transform: 'rotate(3deg)',
        }}
      >
        {/* Kabartma amblem: koyu çizgi üstte, açık çizgi altta = letterpress */}
        <svg
          width={size * 0.46}
          height={size * 0.46}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          style={{ transform: 'rotate(-3deg)' }}
        >
          <g transform="translate(0,0.6)" opacity="0.42">
            <circle cx="13" cy="16" r="8" stroke="#FFE9AE" strokeWidth="1.5" />
            <circle cx="19" cy="16" r="8" stroke="#FFE9AE" strokeWidth="1.5" />
          </g>
          <g opacity="0.72">
            <circle cx="13" cy="16" r="8" stroke="#3D2E0A" strokeWidth="1.5" />
            <circle cx="19" cy="16" r="8" stroke="#3D2E0A" strokeWidth="1.5" />
          </g>
        </svg>
      </span>
    </span>
  )
}
