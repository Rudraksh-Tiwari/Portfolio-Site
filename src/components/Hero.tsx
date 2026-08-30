import Reveal from './primitives/Reveal'
import MaskReveal from './primitives/MaskReveal'
import Magnetic from './primitives/Magnetic'
import QueueRecovery from '../demos/QueueRecovery'

export default function Hero() {
  return (
    <section id="top" className="shell pt-24 pb-16 md:pt-24 md:pb-24">
      <MaskReveal className="h-display max-w-[14ch]">
        <h1>Rudraksh Tiwari</h1>
      </MaskReveal>

      <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-8">
        <Reveal delay={3} className="col-span-12 md:col-span-7">
          <p className="lede max-w-[46ch]">
            I build backend systems. What I care about most is{' '}
            <em className="font-display text-[1.12em] text-signal not-italic">
              correctness under concurrency
            </em>
            : queues that finish after a worker dies.
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
          <ul className="eyebrow flex flex-wrap gap-x-6 gap-y-1">
            <li>CS @ NMIT Bengaluru</li>
            <li>Graduating 2027</li>
            <li>Open to SDE roles</li>
          </ul>
        </Reveal>
      </div>

      {/* Stage 5 replaces this static strip with the live canvas. The proof shown
          is taskq's crash recovery - the one guarantee that is actually built and
          has a verification script behind it. */}
      <Reveal delay={7} className="rule-t mt-16 pt-8">
        <QueueRecovery />

        <ul className="figure mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] tracking-[0.06em] text-smoke">
          <li>worker killed mid-job</li>
          <li className="text-signal">job reclaimed</li>
          <li><span className="text-won">0</span> jobs lost</li>
        </ul>
      </Reveal>
    </section>
  )
}
