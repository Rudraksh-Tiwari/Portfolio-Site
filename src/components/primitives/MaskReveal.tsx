import type { ReactNode } from 'react'
import { useInViewOnce } from '../../lib/useInViewOnce'

/**
 * Wipes a line of type up from behind its own baseline. Used only on the serif
 * headings — if everything wiped, nothing would feel special.
 */
export default function MaskReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(60)

  return (
    <div
      ref={ref}
      className={`maskreveal${inView ? ' is-in' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  )
}
