import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from '../../lib/reducedMotion'

/**
 * Pulls an element a few pixels toward the cursor while hovered. Kept subtle
 * and CSS-eased - at higher strength it stops feeling responsive and starts
 * feeling broken.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  if (reduced) return <span className={className}>{children}</span>

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * strength
        const dy = (e.clientY - (r.top + r.height / 2)) * strength
        el.style.transform = `translate(${dx}px, ${dy}px)`
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = 'translate(0px, 0px)'
      }}
    >
      {children}
    </span>
  )
}
