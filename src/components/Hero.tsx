import Reveal from './primitives/Reveal'
import MaskReveal from './primitives/MaskReveal'
import Magnetic from './primitives/Magnetic'
import QueueRecovery from '../demos/QueueRecovery'

export default function Hero() {
  return (
    <section id="top" className="shell pt-36 pb-20 md:pt-48 md:pb-28">
      <MaskReveal className="h-display max-w-[14ch]">
        <h1>Rudraksh Tiwari</h1>
      </MaskReveal>

      <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-8">
        <Reveal delay={3} className="col-span-12 md:col-span-7">
          <p className="lede max-w-[46ch]">
            I build backend systems, and I care most about{' '}
            <em className="font-display text-[1.12em] text-signal not-italic">
              correctness under concurrency
            </em>{' '}
            — job queues that finish the work after the worker dies, booking flows that
            survive a race, retrieval pipelines that answer from real data instead of
            inventing it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Magnetic><a
              href="/resume.pdf"
              className="border-b border-signal pb-0.5 font-mono text-[12px] tracking-[0.06em] text-signal uppercase"
            >
              Résumé ↓
            </a></Magnetic>
            <Magnetic><a
              href="mailto:rudraksh78779@gmail.com"
              className="border-b border-rule pb-0.5 font-mono text-[12px] tracking-[0.06em] text-ash transition-colors duration-200 hover:border-bone hover:text-bone"
            >
              rudraksh78779@gmail.com
            </a></Magnetic>
          </div>
        </Reveal>

        <Reveal delay={5} className="col-span-12 md:col-span-5">
          <p className="eyebrow">
            CS @ NMIT Bengaluru · Graduating 2027 · Open to SDE roles
          </p>
        </Reveal>
      </div>

      {/* Stage 5 replaces this static strip with the live canvas. The proof shown
          is taskq's crash recovery — the one guarantee that is actually built and
          has a verification script behind it. */}
      <Reveal delay={7} className="rule-t mt-16 pt-8">
        <QueueRecovery />

        <p className="figure mt-4 text-[11px] tracking-[0.06em] text-smoke">
          worker killed mid-job
          &nbsp;·&nbsp; <span className="text-signal">job reclaimed</span>
          &nbsp;·&nbsp; <span className="text-won">0</span> jobs lost
        </p>
      </Reveal>
    </section>
  )
}
