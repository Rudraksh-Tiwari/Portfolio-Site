import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router does not restore scroll on navigation. A new page should open
 * at the top; a link with a hash should land on that element.
 *
 * The retry runs on timers rather than requestAnimationFrame: scroll
 * restoration is navigation, not decoration, so it must not depend on the
 * animation clock running.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    const timers: number[] = []
    let tries = 0

    const attempt = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
      if (tries++ < 40) timers.push(window.setTimeout(attempt, 25))
    }
    attempt()

    return () => timers.forEach(clearTimeout)
  }, [pathname, hash])

  return null
}
