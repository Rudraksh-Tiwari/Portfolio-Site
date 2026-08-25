import { useEffect, useRef } from 'react'
import { useInViewOnce } from '../../lib/useInViewOnce'
import { useReducedMotion } from '../../lib/reducedMotion'

/**
 * Counts every numeric run inside a string up to its target, leaving the rest
 * of the characters alone. One component therefore handles "0.978", "87%",
 * "6.0×" and "13 → 5" (which counts both sides at once) with no special cases.
 *
 * Digits are written straight to the DOM rather than through state — this ticks
 * ~60 times a second per number and has no business re-rendering React. There
 * is a timeout backstop so that if requestAnimationFrame never fires, the
 * final value is still shown rather than a frozen zero.
 */
export default function Counter({ value, className }: { value: string; className?: string }) {
  const [host, inView] = useInViewOnce<HTMLSpanElement>(40)
  const digits = useRef<HTMLSpanElement[]>([])
  const reduced = useReducedMotion()

  const parts = value.split(/(\d+(?:\.\d+)?)/)

  useEffect(() => {
    if (!inView) return

    const nodes = digits.current.filter(Boolean)
    const settle = () => {
      for (const node of nodes) {
        node.textContent = Number(node.dataset.target).toFixed(Number(node.dataset.decimals))
      }
    }

    if (reduced) {
      settle()
      return
    }

    const DURATION = 1100
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      for (const node of nodes) {
        const target = Number(node.dataset.target)
        node.textContent = (target * eased).toFixed(Number(node.dataset.decimals))
      }
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Backstop: if rAF is throttled or never runs, show the real number anyway.
    const backstop = window.setTimeout(settle, DURATION + 400)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(backstop)
    }
  }, [inView, reduced])

  digits.current = []

  return (
    <span ref={host} className={className}>
      {parts.map((part, i) => {
        const isNumber = /^\d/.test(part) && i % 2 === 1
        if (!isNumber) return <span key={i}>{part}</span>

        const decimals = (part.split('.')[1] ?? '').length
        return (
          <span
            key={i}
            ref={(el) => {
              if (el) digits.current.push(el)
            }}
            data-target={part}
            data-decimals={decimals}
            /* Reserve the final width so counting up never reflows the line. */
            style={{ display: 'inline-block', minWidth: `${part.length}ch` }}
          >
            {part}
          </span>
        )
      })}
    </span>
  )
}
