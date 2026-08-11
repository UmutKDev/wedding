import { type ReactNode } from 'react'

interface BaseProps {
  children: ReactNode
  /** Dolgulu (birincil) mi, yoksa yalnızca çerçeveli (ikincil) mi? */
  variant?: 'solid' | 'outline'
  /**
   * `compact`: dar yatay boşluk. Üç harita düğmesi telefonda tek satıra
   * ancak böyle sığıyor — varsayılan boşlukla 2+1 diye sarıyor ve
   * düzen dengesiz görünüyordu.
   */
  size?: 'default' | 'compact'
  className?: string
  icon?: ReactNode
}

type ButtonProps = BaseProps & {
  as?: 'button'
  onClick?: () => void
  type?: 'button' | 'submit'
}

type LinkProps = BaseProps & {
  as: 'a'
  href: string
  /** Dış bağlantı — yeni sekmede açılır */
  external?: boolean
}

/**
 * Altın düğme.
 *
 * 📱 `tap` sınıfı 44×44 minimum dokunma hedefini garanti eder (Apple ve
 * WCAG önerisi). Hover efektleri yalnızca gerçek imleci olan cihazlarda
 * uygulanır — dokunmatikte hover "takılı kalır" ve düğme basılı görünür.
 */
export function GoldButton(props: ButtonProps | LinkProps) {
  const { children, variant = 'outline', size = 'default', className = '', icon } = props

  const base = `tap group relative gap-2.5 rounded-full text-[0.8125rem] font-medium tracking-[0.14em] uppercase transition-all duration-400 active:scale-[0.97] ${
    size === 'compact' ? 'w-full px-2' : 'px-6'
  }`

  // Dolgulu düğmede metin KOYU: altın dolgunun üstünde fildişi bir yazı
  // 2:1'in altında kalırdı. Kömür grisi en açık altın tonunda bile 4.8:1.
  const styles =
    variant === 'solid'
      ? 'text-ink pointer-fine:hover:brightness-110'
      : 'text-gold border border-[color-mix(in_oklab,var(--color-gold)_40%,transparent)] pointer-fine:hover:border-[color-mix(in_oklab,var(--color-gold)_85%,transparent)] pointer-fine:hover:bg-[color-mix(in_oklab,var(--color-gold)_10%,transparent)]'

  const solidBackground =
    variant === 'solid'
      ? {
          backgroundImage:
            'linear-gradient(135deg, var(--color-gold-lit) 0%, var(--color-gold) 52%, var(--color-gold-deep) 100%)',
          boxShadow: '0 6px 20px -6px rgba(201,162,39,0.55)',
        }
      : undefined

  const content = (
    <>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </>
  )

  if (props.as === 'a') {
    return (
      <a
        href={props.href}
        className={`${base} ${styles} ${className}`}
        style={solidBackground}
        {...(props.external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      className={`${base} ${styles} ${className}`}
      style={solidBackground}
    >
      {content}
    </button>
  )
}
