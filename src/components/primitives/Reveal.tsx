import type { ReactNode } from 'react'
import { useInViewOnce } from '../../lib/useInViewOnce'

interface RevealProps {
  children: ReactNode
  /** Stagger position within a group, in steps of 60ms. */
  delay?: number
  className?: string
}

/**
 * Fade-and-rise on first entry, one-shot.
 *
 * Deliberately a CSS class toggle rather than a JS-driven animation. The whole
 * page starts at opacity 0, so the reveal is on the critical path for the site
 * being readable at all — and a CSS transition cannot decide not to run.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' is-in' : ''}${className ? ' ' + className : ''}`}
      style={delay ? { transitionDelay: `${delay * 60}ms` } : undefined}
    >
      {children}
    </div>
  )
}
