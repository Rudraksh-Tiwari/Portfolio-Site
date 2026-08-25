import { useEffect, useRef, useState } from 'react'
import photo from '../assets/photo.jpg'

/**
 * The opening sequence.
 *
 *     0ms  three rings sweep inward at staggered speeds — racing requests
 *   950ms  they collide; ONE locks, the other two dissolve
 *  1150ms  the photo settles inside the winner
 *  1150ms  ...and holds, so there is a moment to actually look at it
 *  2400ms  the assembly shrinks and flies to the header slot
 *  3200ms  impact: a shockwave crosses the page and the site is revealed
 *  4000ms  overlay unmounts (page is interactive from 3550ms)
 *
 * Rules this obeys, because a slow or unskippable intro is worse than none:
 *   · the page underneath is fully rendered the whole time — this is an
 *     overlay, never a content gate
 *   · any click, scroll, touch or keypress jumps straight to the end
 *   · it runs once per session
 *   · prefers-reduced-motion skips it entirely
 */

const SESSION_KEY = 'intro-played'

export default function Intro() {
  // Decided at first render, not inside the effect. Checking sessionStorage
  // *inside* the effect breaks under StrictMode's double-invoke: the first run
  // sets the flag, the second sees it and bails, and the overlay is left
  // mounted forever with no timeline running.
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return reduced || sessionStorage.getItem(SESSION_KEY) === '1'
  })
  const overlay = useRef<HTMLDivElement>(null)
  const assembly = useRef<HTMLDivElement>(null)
  const rings = useRef<(HTMLDivElement | null)[]>([])
  const photoRef = useRef<HTMLDivElement>(null)
  const wave = useRef<HTMLDivElement>(null)
  const bloom = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (done) return

    sessionStorage.setItem(SESSION_KEY, '1')
    document.documentElement.style.overflow = 'hidden'

    const EASE = 'cubic-bezier(.16,1,.3,1)'
    const t0 = performance.now()
    // Dev-only trace. The sequence is shorter than a devtools round-trip, so
    // this is the only reliable way to confirm each phase actually fired.
    const log = (phase: string) => {
      if (!import.meta.env.DEV) return
      const w = window as unknown as { __introLog?: { t: number; phase: string }[] }
      ;(w.__introLog ??= []).push({ t: Math.round(performance.now() - t0), phase })
    }
    const at = (ms: number, fn: () => void, phase?: string) => {
      timers.current.push(window.setTimeout(() => { if (phase) log(phase); fn() }, ms))
    }
    log('start')

    const finish = () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      document.documentElement.style.overflow = ''
      setDone(true)
    }

    // Any input at all skips to the end.
    const skip = () => finish()
    const opts = { once: true, passive: true } as const
    window.addEventListener('pointerdown', skip, opts)
    window.addEventListener('wheel', skip, opts)
    window.addEventListener('touchstart', skip, opts)
    window.addEventListener('keydown', skip, opts)

    // 1 — rings converge
    rings.current.forEach((r, i) => {
      if (!r) return
      at(i * 80, () => {
        r.style.transition = `transform 660ms ${EASE}, opacity 260ms ease`
        r.style.opacity = String(0.85 - i * 0.2)
        r.style.transform = 'scale(1)'
      })
    })

    // 2 — exactly one survives
    at(660, () => {
      const [win, a, b] = rings.current
      if (a) { a.style.transition = 'opacity 250ms ease'; a.style.opacity = '0' }
      if (b) { b.style.transition = 'opacity 250ms ease'; b.style.opacity = '0' }
      if (win) {
        win.style.transition = 'border-width 220ms ease, opacity 220ms ease'
        win.style.borderWidth = '2px'
        win.style.opacity = '1'
      }
    })

    // 3 — the photo settles inside it
    at(720, () => {
      const p = photoRef.current
      if (!p) return
      p.style.transition = `opacity 360ms ease, transform 520ms ${EASE}`
      p.style.opacity = '1'
      p.style.transform = 'scale(1)'
    })

    // 4 — flight to the header slot, measured live so it always lands true
    at(1220, () => {
      const slot = document.getElementById('avatar-slot')
      const asm = assembly.current
      if (!slot || !asm) return
      const s = slot.getBoundingClientRect()
      const a = asm.getBoundingClientRect()
      const dx = s.left + s.width / 2 - (a.left + a.width / 2)
      const dy = s.top + s.height / 2 - (a.top + a.height / 2)
      asm.style.transition = `transform 600ms ${EASE}`
      asm.style.transform = `translate(${dx}px, ${dy}px) scale(${s.width / 240})`
    })

    // 5 — impact
    at(1820, () => {  // phase: impact
      const slot = document.getElementById('avatar-slot')
      const w = wave.current
      const bl = bloom.current
      if (slot && w && bl) {
        const s = slot.getBoundingClientRect()
        const cx = s.left + s.width / 2
        const cy = s.top + s.height / 2
        const reach = Math.hypot(
          Math.max(cx, window.innerWidth - cx),
          Math.max(cy, window.innerHeight - cy),
        )
        const size = 120
        for (const el of [w, bl]) {
          el.style.left = `${cx - size / 2}px`
          el.style.top = `${cy - size / 2}px`
        }
        // shockwave: a ring crossing the whole page. Held at full strength
        // briefly before fading, otherwise it is gone before the eye finds it.
        w.style.opacity = '0.9'
        w.style.borderWidth = '2px'
        w.style.transition = 'transform 760ms cubic-bezier(.22,.61,.36,1), opacity 660ms ease-out 150ms'
        w.style.transform = `scale(${(reach * 2.1) / size})`
        requestAnimationFrame(() => { w.style.opacity = '0' })
        // bloom: a short warm flash at the point of impact
        bl.style.transition = 'transform 540ms ease-out, opacity 540ms ease-out'
        bl.style.opacity = '0.5'
        bl.style.transform = 'scale(5)'
        requestAnimationFrame(() => { bl.style.opacity = '0' })
      }
      // the ground drops away and the site is there
      const ov = overlay.current
      if (ov) {
        ov.style.transition = 'opacity 380ms ease'
        ov.style.opacity = '0'
      }
      const asm = assembly.current
      if (asm) {
        asm.style.transition = 'opacity 200ms ease'
        asm.style.opacity = '0'
      }
      log('impact')
    })

    // Release the page as soon as it is readable...
    at(2150, () => {
      document.documentElement.style.overflow = ''
      log('unlocked')
    })
    // ...but keep the overlay mounted until the shockwave has finished
    // travelling. It is pointer-events-none and fully transparent by now, so
    // it blocks nothing — unmounting at 1560ms cut the wave off mid-flight,
    // which is why no explosion was visible.
    at(2500, finish, 'end')

    return () => {
      timers.current.forEach(clearTimeout)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
      window.removeEventListener('keydown', skip)
      document.documentElement.style.overflow = ''
    }
  }, [done])

  if (done) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      {/* opaque ground — the site is already rendered underneath it */}
      <div ref={overlay} className="absolute inset-0 bg-ink" />

      {/* shockwave + bloom, positioned at the avatar on impact */}
      <div
        ref={wave}
        className="absolute size-[120px] rounded-full border border-signal opacity-0"
      />
      <div
        ref={bloom}
        className="absolute size-[120px] rounded-full opacity-0"
        style={{
          background:
            'radial-gradient(circle, rgba(245,165,36,0.55) 0%, rgba(245,165,36,0.15) 45%, transparent 70%)',
        }}
      />

      <div
        ref={assembly}
        className="absolute top-1/2 left-1/2 -mt-[120px] -ml-[120px] size-[240px]"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => { rings.current[i] = el }}
            className="absolute inset-0 rounded-full border border-signal opacity-0"
            style={{ transform: `scale(${2.5 + i * 0.7})` }}
          />
        ))}
        <div
          ref={photoRef}
          className="absolute inset-[14px] overflow-hidden rounded-full opacity-0"
          style={{ transform: 'scale(.86)' }}
        >
          <img src={photo} alt="" className="size-full object-cover" />
        </div>
      </div>
    </div>
  )
}
