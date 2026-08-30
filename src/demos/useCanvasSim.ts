import { useEffect, useRef } from 'react'
import { observeVisibility } from '../lib/viewport'

export interface Sim {
  /** Called on mount and on every resize. Rebuild layout-dependent state here. */
  build(w: number, h: number): void
  step(dt: number): void
  draw(ctx: CanvasRenderingContext2D, w: number, h: number): void
  /** Steps to fast-forward before drawing the single reduced-motion frame. */
  settleFrames?: number
}

/**
 * Shared plumbing for every canvas on the page: DPR scaling, resize handling,
 * a fixed 30fps timestep, and pausing when offscreen or backgrounded.
 *
 * Two deliberate choices:
 *  - 30fps, not 60. These are ambient diagrams, not games; halving the frame
 *    budget halves the cost and nobody can tell.
 *  - Visibility comes from the shared geometry check, not IntersectionObserver,
 *    so a demo below the fold can never be left frozen by an observer that
 *    quietly stops reporting.
 */
export function useCanvasSim(create: () => Sim) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const createRef = useRef(create)
  createRef.current = create

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sim = createRef.current()
    let w = 0
    let h = 0

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sim.build(w, h)
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < (sim.settleFrames ?? 60); i++) sim.step(1 / 30)
      sim.draw(ctx, w, h)
      return () => ro.disconnect()
    }

    let onscreen = true
    const unobserve = observeVisibility(canvas, (v) => { onscreen = v }, 160)

    let raf = 0
    let last = performance.now()
    let acc = 0
    const STEP = 1 / 30

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (!onscreen || document.hidden) return
      acc += dt
      while (acc >= STEP) {
        sim.step(STEP)
        acc -= STEP
      }
      sim.draw(ctx, w, h)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      unobserve()
    }
  }, [])

  return canvasRef
}

export const PALETTE = {
  ink: '#08090A',
  coal: '#2A2A2C',
  smoke: '#6E6A65',
  ash: '#A8A49E',
  bone: '#EDEAE5',
  signal: '#F5A524',
  won: '#22D3EE',
  fail: '#F0553B',
} as const

/** Ease-out cubic - the house easing, matching the CSS transitions. */
export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)
