import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Lenis owns the scroll for the whole page. We keep the instance module-scoped
 * so nav links can drive it directly (Lenis does not intercept anchor clicks
 * on its own, and native `scrollIntoView` fights the smoothing).
 */
let instance: Lenis | null = null

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useSmoothScroll(): void {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: quick departure, long settle — the "expensive" feel
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })
    instance = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      instance = null
    }
  }, [])
}

/**
 * Jump to the top with no animation. Route changes must use this rather than
 * window.scrollTo: Lenis owns the scroll position and will happily continue a
 * smooth animation straight over a native scroll, landing you mid-page.
 */
export function scrollToTopNow(): void {
  // Move natively FIRST, then tell Lenis. Lenis applies even an "immediate"
  // scroll from inside its rAF loop, so on a route change — or anywhere rAF is
  // throttled — relying on it alone can leave the new page scrolled to wherever
  // the old one was.
  window.scrollTo(0, 0)
  instance?.scrollTo(0, { immediate: true })
}

const HEADER_OFFSET = 80

/**
 * Jump straight to a section with no animation, computing the target position
 * ourselves. Route changes use this rather than the smooth variant: handing
 * Lenis an element to measure on a route that has only just mounted gives
 * unreliable results, whereas a number is a number.
 */
export function jumpToSection(id: string): boolean {
  const target = document.getElementById(id)
  if (!target) return false
  const y = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo(0, y)
  if (instance) {
    instance.resize()
    instance.scrollTo(y, { immediate: true })
  }
  return true
}

/** Force Lenis to re-measure after the document height changes. */
export function refreshScroll(): void {
  instance?.resize()
}

/** Scroll to a section by id, honouring reduced-motion. */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id)
  if (!target) return

  if (instance) {
    instance.scrollTo(target, { offset: -HEADER_OFFSET })
  } else {
    target.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}
