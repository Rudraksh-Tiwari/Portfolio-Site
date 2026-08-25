import { useCanvasSim, PALETTE, easeOut, type Sim } from './useCanvasSim'

/**
 * Loan Risk Analyzer: SHAP attribution resolving into a decision.
 *
 * Bars grow out from a centre axis — right for features pushing toward
 * approval, left for features pushing against — then the verdict lands.
 *
 * Three tiers, matching the decision engine in the app: below 0.3 approved,
 * below 0.7 flagged for human review, otherwise rejected. All three are shown
 * in rotation, because a demo that only ever approves proves nothing.
 */

interface Applicant {
  verdict: string
  risk: number
  tone: string
  features: { label: string; value: number }[] // -1..1
}

const APPLICANTS: Applicant[] = [
  {
    verdict: 'Approved',
    risk: 0.12,
    tone: PALETTE.won,
    features: [
      { label: 'income / loan ratio', value: 0.78 },
      { label: 'credit history length', value: 0.52 },
      { label: 'no prior defaults', value: 0.34 },
      { label: 'loan intent', value: -0.21 },
      { label: 'interest rate', value: -0.3 },
    ],
  },
  {
    verdict: 'Flagged for review',
    risk: 0.54,
    tone: PALETTE.signal,
    features: [
      { label: 'interest rate', value: -0.46 },
      { label: 'employment length', value: -0.38 },
      { label: 'income / loan ratio', value: 0.41 },
      { label: 'credit score', value: 0.29 },
      { label: 'loan intent', value: -0.24 },
    ],
  },
  {
    verdict: 'Rejected',
    risk: 0.88,
    tone: PALETTE.fail,
    features: [
      { label: 'prior defaults on file', value: -0.82 },
      { label: 'interest rate', value: -0.55 },
      { label: 'income / loan ratio', value: -0.3 },
      { label: 'employment length', value: 0.24 },
      { label: 'credit history length', value: 0.18 },
    ],
  },
]

const CYCLE = 5.4

export default function ShapBars() {
  const ref = useCanvasSim((): Sim => {
    let t = 0

    return {
      settleFrames: 90,
      build() {},
      step(dt) {
        t += dt
      },
      draw(ctx, w, h) {
        ctx.clearRect(0, 0, w, h)

        const which = Math.floor(t / CYCLE) % APPLICANTS.length
        const p = t % CYCLE
        const grow = easeOut(Math.min(p / 1.0, 1))
        const verdictAlpha = p > 1.2 ? Math.min(1, (p - 1.2) / 0.45) : 0

        const app = APPLICANTS[which]
        const axis = w * 0.44
        const maxBar = Math.min(w * 0.28, 180)
        const rowH = 13
        const top = 8

        ctx.strokeStyle = PALETTE.coal
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(axis + 0.5, top - 3)
        ctx.lineTo(axis + 0.5, top + app.features.length * rowH + 2)
        ctx.stroke()

        ctx.font = '9.5px "IBM Plex Mono", monospace'
        ctx.textBaseline = 'middle'

        app.features.forEach((f, i) => {
          const y = top + i * rowH + rowH / 2
          const len = Math.abs(f.value) * maxBar * grow
          const positive = f.value > 0
          ctx.fillStyle = positive ? PALETTE.won : PALETTE.fail
          ctx.globalAlpha = 0.85
          if (positive) ctx.fillRect(axis + 1, y - 3.5, len, 7)
          else ctx.fillRect(axis - len, y - 3.5, len, 7)
          ctx.globalAlpha = 1

          ctx.fillStyle = PALETTE.smoke
          if (positive) {
            ctx.textAlign = 'left'
            ctx.fillText(f.label, axis + len + 7, y)
          } else {
            ctx.textAlign = 'right'
            ctx.fillText(f.label, axis - len - 7, y)
          }
        })

        const baseline = top + app.features.length * rowH + 15
        ctx.globalAlpha = verdictAlpha
        ctx.textAlign = 'left'
        ctx.font = '11px "IBM Plex Mono", monospace'
        ctx.fillStyle = app.tone
        ctx.fillText(app.verdict, 0, baseline)

        ctx.fillStyle = PALETTE.smoke
        ctx.font = '9.5px "IBM Plex Mono", monospace'
        ctx.fillText(`risk ${app.risk.toFixed(2)}`, Math.min(150, w * 0.42), baseline)
        ctx.globalAlpha = 1

        // the tier scale, so the thresholds are legible
        ctx.globalAlpha = 0.9
        ctx.font = '9px "IBM Plex Mono", monospace'
        ctx.fillStyle = PALETTE.coal
        ctx.fillText('approved < 0.30   ·   review < 0.70   ·   rejected', Math.min(230, w * 0.55), baseline)
        ctx.globalAlpha = 1
        ctx.textAlign = 'left'
      },
    }
  })

  return <canvas ref={ref} className="block h-[112px] w-full" aria-hidden="true" />
}
