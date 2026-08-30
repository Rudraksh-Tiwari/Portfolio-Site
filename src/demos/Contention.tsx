import { useCanvasSim, PALETTE, type Sim } from './useCanvasSim'

/**
 * taskq's exactly-once proof, as run by verify_stage3 test A: 45 jobs, three
 * worker processes of four threads each - twelve concurrent claimants - and
 * every job executed exactly once.
 *
 * Twelve claimants race for the grid. A job briefly flashes amber as it is
 * contended, then locks cyan. Because the Lua claim script is atomic, a cell
 * that is already taken can never be taken again - so no cell ever goes cyan
 * twice, which is the thing being demonstrated.
 */

const TOTAL = 45
const CLAIMANTS = 12

type Cell = { state: 'idle' | 'contended' | 'done'; t: number }

export default function Contention() {
  const ref = useCanvasSim((): Sim => {
    let cells: Cell[] = []
    let claimed = 0
    let nextIn = 0.25
    let holdAfter = 0

    const reset = () => {
      cells = Array.from({ length: TOTAL }, () => ({ state: 'idle', t: 0 }))
      claimed = 0
      nextIn = 0.25
      holdAfter = 0
    }
    reset()

    return {
      settleFrames: 240,
      build() {},
      step(dt) {
        for (const c of cells) c.t += dt

        if (claimed >= TOTAL) {
          holdAfter += dt
          if (holdAfter > 2.6) reset()
          return
        }

        nextIn -= dt
        if (nextIn > 0) return
        nextIn = 0.13 + Math.random() * 0.06

        // Several claimants land on the same tick; only unclaimed cells can be
        // taken, which is the atomicity being modelled.
        const batch = 1 + Math.floor(Math.random() * 2)
        for (let b = 0; b < batch; b++) {
          const free = cells.map((c, i) => (c.state === 'idle' ? i : -1)).filter((i) => i >= 0)
          if (!free.length) break
          const idx = free[Math.floor(Math.random() * free.length)]
          cells[idx].state = 'contended'
          cells[idx].t = 0
        }

        for (const c of cells) {
          if (c.state === 'contended' && c.t > 0.22) {
            c.state = 'done'
            c.t = 0
            claimed++
          }
        }
      },
      draw(ctx, w, h) {
        ctx.clearRect(0, 0, w, h)

        const cols = w < 480 ? 9 : 15
        const rows = Math.ceil(TOTAL / cols)
        const gap = 4
        const size = Math.min((w - (cols - 1) * gap) / cols, 14)
        const gridW = cols * size + (cols - 1) * gap
        const top = 26

        cells.forEach((c, i) => {
          const cx = (i % cols) * (size + gap)
          const cy = top + Math.floor(i / cols) * (size + gap)
          if (c.state === 'done') {
            ctx.fillStyle = PALETTE.won
            ctx.globalAlpha = 0.9
            ctx.fillRect(cx, cy, size, size)
          } else if (c.state === 'contended') {
            ctx.fillStyle = PALETTE.signal
            ctx.globalAlpha = 1
            ctx.fillRect(cx, cy, size, size)
          } else {
            ctx.strokeStyle = PALETTE.coal
            ctx.lineWidth = 1
            ctx.globalAlpha = 1
            ctx.strokeRect(cx + 0.5, cy + 0.5, size - 1, size - 1)
          }
          ctx.globalAlpha = 1
        })

        // header readout
        ctx.font = '10px "IBM Plex Mono", monospace'
        ctx.textBaseline = 'top'
        ctx.fillStyle = PALETTE.smoke
        ctx.fillText(`${CLAIMANTS} concurrent claimants`, 0, 2)

        ctx.fillStyle = claimed >= TOTAL ? PALETTE.won : PALETTE.ash
        const readout = `${claimed} / ${TOTAL} executed exactly once`
        ctx.fillText(readout, Math.max(150, gridW - 168), 2)

        void rows
      },
    }
  })

  return <canvas ref={ref} className="block h-[110px] w-full" aria-hidden="true" />
}
