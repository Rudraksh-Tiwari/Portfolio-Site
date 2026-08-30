import { useEffect, useRef } from 'react'
import { prefersReduced } from '../lib/reducedMotion'

/**
 * A very low-opacity warm light trailing the cursor. It should never be
 * consciously noticed - it exists so the near-black ground reads with some
 * depth instead of as a flat sheet.
 */
export default function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    // Pointer-coarse devices have no cursor to follow.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const el = ref.current
    if (!el) return
    el.style.opacity = '1'

    const onMove = (e: PointerEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-0 size-[620px] rounded-full opacity-0"
      style={{
        transform: 'translate(-500px, -500px)',
        transition: 'transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        background:
          'radial-gradient(circle, rgba(245,165,36,0.055) 0%, rgba(245,165,36,0.018) 38%, transparent 68%)',
      }}
    />
  )
}
