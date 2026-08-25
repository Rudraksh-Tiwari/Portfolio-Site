import { useCanvasSim, PALETTE, type Sim } from './useCanvasSim'

/**
 * The hero demo: taskq's crash-recovery guarantee, running live.
 *
 * Jobs flow in from the left and are claimed by workers. Every few seconds a
 * worker is killed mid-job -- it goes dark and its job is stranded in amber.
 * When the lease expires the job is reclaimed by another worker and runs to
 * completion. Nothing is ever dropped, which is the whole point of the project
 * and the claim in the caption underneath.
 */

type JobState = 'travel' | 'processing' | 'stranded' | 'reclaim' | 'done'

interface Job {
  x: number
  target: number
  state: JobState
  t: number
  alpha: number
}

interface Worker {
  x: number
  alive: boolean
  deadFor: number
  job: Job | null
}

export default function QueueRecovery() {
  const ref = useCanvasSim((): Sim => {
    let w = 0
    let workers: Worker[] = []
    let jobs: Job[] = []
    let spawnIn = 0.2
    let killIn = 3.4

    const freeWorker = () => workers.findIndex((k) => k.alive && !k.job)

    return {
      settleFrames: 90,

      build(width) {
        w = width
        // Narrow viewports get two workers instead of three, so the lane keeps
        // enough runway to read as a queue rather than a huddle.
        const count = w < 520 ? 2 : 3
        const first = w < 520 ? 0.62 : 0.58
        const gap = w < 520 ? 0.2 : 0.16
        workers = Array.from({ length: count }, (_, i) => ({
          x: w * (first + i * gap),
          alive: true,
          deadFor: 0,
          job: null,
        }))
        jobs = []
      },

      step(dt) {
        spawnIn -= dt
        if (spawnIn <= 0) {
          spawnIn = 0.55 + Math.random() * 0.5
          const target = freeWorker()
          if (target !== -1) {
            const job: Job = { x: -8, target, state: 'travel', t: 0, alpha: 1 }
            jobs.push(job)
            workers[target].job = job
          }
        }

        killIn -= dt
        if (killIn <= 0) {
          killIn = 6.5 + Math.random() * 2
          const victim = workers.findIndex((k) => k.alive && k.job?.state === 'processing')
          if (victim !== -1) {
            workers[victim].alive = false
            workers[victim].deadFor = 0
            const stranded = workers[victim].job
            if (stranded) {
              stranded.state = 'stranded'
              stranded.t = 0
            }
            workers[victim].job = null
          }
        }

        for (const k of workers) {
          if (!k.alive) {
            k.deadFor += dt
            if (k.deadFor > 2.4) {
              k.alive = true
              k.job = null
            }
          }
        }

        const speed = w * 0.34
        for (const j of jobs) {
          j.t += dt
          const wx = workers[j.target]?.x ?? w

          if (j.state === 'travel' || j.state === 'reclaim') {
            j.x = Math.min(wx, j.x + speed * dt)
            if (j.x >= wx - 0.5) {
              j.state = 'processing'
              j.t = 0
            }
          } else if (j.state === 'processing') {
            if (j.t > 0.95) {
              j.state = 'done'
              j.t = 0
              const owner = workers[j.target]
              if (owner && owner.job === j) owner.job = null
            }
          } else if (j.state === 'stranded') {
            // Lease expiry: the reaper hands the job to another live worker.
            if (j.t > 1.25) {
              const next = freeWorker()
              if (next !== -1) {
                j.target = next
                j.state = 'reclaim'
                j.t = 0
                workers[next].job = j
              }
            }
          } else if (j.state === 'done') {
            j.alpha = Math.max(0, 1 - j.t / 0.45)
          }
        }
        jobs = jobs.filter((j) => !(j.state === 'done' && j.alpha <= 0))
      },

      draw(ctx, width, height) {
        ctx.clearRect(0, 0, width, height)
        const y = height * 0.5

        ctx.strokeStyle = PALETTE.coal
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(width, y + 0.5)
        ctx.stroke()

        for (const k of workers) {
          if (!k.alive) {
            ctx.globalAlpha = 0.45 + 0.25 * Math.sin(k.deadFor * 9)
            ctx.strokeStyle = PALETTE.fail
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(k.x, y, 9, 0, Math.PI * 2)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(k.x - 4, y - 4)
            ctx.lineTo(k.x + 4, y + 4)
            ctx.stroke()
            ctx.globalAlpha = 1
          } else {
            ctx.strokeStyle = k.job ? PALETTE.signal : PALETTE.smoke
            ctx.lineWidth = k.job ? 1.5 : 1
            ctx.globalAlpha = k.job ? 1 : 0.5
            ctx.beginPath()
            ctx.arc(k.x, y, 9, 0, Math.PI * 2)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }

        for (const j of jobs) {
          const r = j.state === 'done' ? 5 : 3.2
          let color: string = PALETTE.smoke
          if (j.state === 'processing' || j.state === 'stranded' || j.state === 'reclaim') {
            color = PALETTE.signal
          } else if (j.state === 'done') {
            color = PALETTE.won
          }

          const blink = j.state === 'stranded' ? 0.55 + 0.45 * Math.sin(j.t * 10) : 1
          ctx.globalAlpha = j.alpha * blink
          ctx.fillStyle = color
          if (j.state === 'done') {
            ctx.shadowColor = PALETTE.won
            ctx.shadowBlur = 12
          }
          ctx.beginPath()
          ctx.arc(j.x, y, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        }
      },
    }
  })

  return (
    <canvas
      ref={ref}
      className="block h-[76px] w-full max-w-[720px]"
      aria-hidden="true"
    />
  )
}
