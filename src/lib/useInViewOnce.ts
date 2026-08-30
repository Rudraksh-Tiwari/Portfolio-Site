import { useEffect, useRef, useState } from 'react'
import { observeVisibility } from './viewport'

/**
 * Fires once, the first time the element enters the viewport.
 *
 * Backed by the shared geometry check rather than IntersectionObserver - see
 * lib/viewport.ts for why. Every reveal on this page starts at opacity 0, so
 * "the visibility signal stopped arriving" must never be a state this can
 * reach: an invisible page is a worse failure than a missed animation.
 */
export function useInViewOnce<T extends HTMLElement>(
  margin = 120,
): readonly [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let done = false
    const stop = observeVisibility(
      el,
      (visible) => {
        if (!visible) return
        done = true
        setInView(true)
      },
      margin,
    )
    // `done` may already be true: observeVisibility measures synchronously, so
    // an element that is on screen at mount calls back before `stop` exists.
    if (done) stop()
    return stop
  }, [margin])

  return [ref, inView] as const
}
