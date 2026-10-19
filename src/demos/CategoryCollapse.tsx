import { useCanvasSim, PALETTE, easeOut, type Sim } from './useCanvasSim'

/**
 * Clarifi's categoriser failure and fix.
 *
 * Phase 1: every transaction falls into one bucket, because "UPI" appears on
 * nearly every line of an Indian bank statement and was being treated as a
 * category keyword. The bar runs to 87% in the failure colour.
 * Phase 2: merchant identity is separated from payment rail, and the same
 * statement resolves into a real breakdown.
 *
 * One stacked bar, morphing between the two states, on a loop.
 */

interface Row {
  label: string
  share: number
  tone: string
}

const BROKEN: Row[] = [
  { label: 'UPI', share: 0.87, tone: PALETTE.fail },
  { label: 'Food', share: 0.05, tone: PALETTE.coal },
  { label: 'Bills', share: 0.04, tone: PALETTE.coal },
  { label: 'Transport', share: 0.02, tone: PALETTE.coal },
  { label: 'Other', share: 0.02, tone: PALETTE.coal },
]

const FIXED: Row[] = [
  { label: 'Food', share: 0.31, tone: PALETTE.signal },
  { label: 'Bills', share: 0.24, tone: PALETTE.ash },
  { label: 'Transport', share: 0.18, tone: PALETTE.smoke },
  { label: 'Shopping', share: 0.16, tone: PALETTE.won },
  { label: 'Other', share: 0.11, tone: PALETTE.coal },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], t)))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

export default function CategoryCollapse() {
  const ref = useCanvasSim((): Sim => {
    let t = 0
    // 0 = broken, 1 = fixed. Holds at each end so both states can be read.
    let mix = 0

    return {
      settleFrames: 200,
      build() {},
      step(dt) {
        t += dt
        const CYCLE = 9
        const p = t % CYCLE
        if (p < 2.6) mix = 0
        else if (p < 3.8) mix = easeOut((p - 2.6) / 1.2)
        else if (p < 7.2) mix = 1
        else mix = 1 - easeOut((p - 7.2) / 1.2)
      },
      draw(ctx, w, h) {
        ctx.clearRect(0, 0, w, h)

        const padX = 0
        const barY = h * 0.30
        const barH = 16
        const barW = w - padX * 2

        // stacked bar
        let x = padX
        for (let i = 0; i < BROKEN.length; i++) {
          const share = lerp(BROKEN[i].share, FIXED[i].share, mix)
          const tone = mixHex(BROKEN[i].tone, FIXED[i].tone, mix)
          const segW = share * barW
          ctx.fillStyle = tone
          ctx.globalAlpha = 0.92
          ctx.fillRect(x, barY, Math.max(0, segW - 2), barH)
          ctx.globalAlpha = 1
          x += segW
        }

        // labels underneath, fading between the two readings
        ctx.font = '500 11px "Hanken Grotesk", system-ui, sans-serif'
        ctx.textBaseline = 'top'

        const write = (rows: Row[], alpha: number) => {
          if (alpha <= 0.01) return
          ctx.globalAlpha = alpha
          let lx = padX
          for (const r of rows) {
            const segW = r.share * barW
            if (segW > 46) {
              ctx.fillStyle = r.tone === PALETTE.coal ? PALETTE.smoke : r.tone
              ctx.fillText(
                `${r.label} ${Math.round(r.share * 100)}%`,
                lx + 2,
                barY + barH + 9,
              )
            }
            lx += segW
          }
          ctx.globalAlpha = 1
        }
        write(BROKEN, 1 - mix)
        write(FIXED, mix)

        // caption
        ctx.globalAlpha = 1
        ctx.fillStyle = PALETTE.smoke
        ctx.font = '500 11px "Hanken Grotesk", system-ui, sans-serif'
        const caption =
          mix < 0.5
            ? 'payment rail treated as a category  ->  one bucket'
            : 'merchant identity separated from rail  ->  real breakdown'
        ctx.fillText(caption, padX, 2)
      },
    }
  })

  return <canvas ref={ref} className="block h-[92px] w-full" aria-hidden="true" />
}
