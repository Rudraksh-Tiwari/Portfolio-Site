import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { jumpToSection, scrollToTopNow } from './smoothScroll'

/**
 * React Router does not restore scroll on navigation. Opening a case study
 * should land at the top; returning to "/#work" should land on the work
 * section rather than the hero.
 *
 * The retry runs on timers rather than requestAnimationFrame. rAF is the
 * natural choice, but it is throttled or suspended in plenty of real contexts
 * — and scroll restoration is navigation, not decoration, so it must not
 * depend on the animation clock running.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      scrollToTopNow()
      return
    }

    const id = hash.slice(1)
    const timers: number[] = []
    let tries = 0

    const attempt = () => {
      if (jumpToSection(id)) {
        // Re-issue after layout settles: the page keeps growing for a few
        // hundred ms as reveals and canvases take their space, which moves the
        // target out from under the first measurement.
        timers.push(window.setTimeout(() => jumpToSection(id), 250))
        timers.push(window.setTimeout(() => jumpToSection(id), 600))
        return
      }
      if (tries++ < 40) timers.push(window.setTimeout(attempt, 25))
    }
    attempt()

    return () => timers.forEach(clearTimeout)
  }, [pathname, hash])

  return null
}
