import { useEffect, useRef } from 'react'
import { useInViewOnce } from '../../lib/useInViewOnce'
import { useReducedMotion } from '../../lib/reducedMotion'

/**
 * Counts every numeric run inside a string up to its target, leaving the rest
 * of the characters alone. One component therefore handles "0.978", "87%",
 * "6.0×", "2,000" and "13 → 5" (which counts both sides at once) with no
 * special cases.
 *
 * A numeric run deliberately swallows thousands separators, so "2,000" is one
 * number rather than "2" and "000" - the latter rendered as "2,0", because
 * Number("000") is 0. Grouped values are re-formatted with their separators on
 * every frame, so the digits keep their commas while counting.
 *
 * Digits are written straight to the DOM rather than through state - this ticks
 * ~60 times a second per number and has no business re-rendering React. There
 * is a timeout backstop so that if requestAnimationFrame never fires, the
 * final value is still shown rather than a frozen zero.
 */
export default function Counter({ value, className }: { value: string; className?: string }) {
  const [host, inView] = useInViewOnce<HTMLSpanElement>(40)
  const digits = useRef<HTMLSpanElement[]>([])
  const reduced = useReducedMotion()

  const parts = value.split(/(\d[\d,]*(?:\.\d+)?)/)

  useEffect(() => {
    if (!inView) return

    const nodes = digits.current.filter(Boolean)

    const render = (node: HTMLSpanElement, n: number) => {
      const decimals = Number(node.dataset.decimals)
      return node.dataset.grouped === '1'
        ? n.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : n.toFixed(decimals)
    }

    const settle = () => {
      for (const node of nodes) {
        node.textContent = render(node, Number(node.dataset.target))
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
        node.textContent = render(node, Number(node.dataset.target) * eased)
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

        // Strip separators for the arithmetic; remember that they were there
        // so the value is re-grouped on the way back out.
        const plain = part.replace(/,/g, '')
        const decimals = (plain.split('.')[1] ?? '').length
        // Reserve exactly the final value's width - an invisible copy shares
        // the grid cell - so counting up never reflows the line and the
        // settled number sits flush against its suffix.
        return (
          <span key={i} style={{ display: 'inline-grid' }}>
            <span aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden' }}>{part}</span>
            <span
              ref={(el) => {
                if (el) digits.current.push(el)
              }}
              data-target={plain}
              data-decimals={decimals}
              data-grouped={part.includes(',') ? '1' : '0'}
              style={{ gridArea: '1 / 1', textAlign: 'right' }}
            >
              {part}
            </span>
          </span>
        )
      })}
    </span>
  )
}
