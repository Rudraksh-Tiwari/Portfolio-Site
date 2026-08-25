import { skillGroups } from '../content/skills'
import Reveal from './primitives/Reveal'
import MaskReveal from './primitives/MaskReveal'

/**
 * Rendered as a spec sheet rather than a cloud of pill badges — same
 * information, but it reads as a datasheet, which is the point.
 */
export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-20">
      <div className="shell rule-t py-20 md:py-28">
        <div className="grid grid-cols-12 gap-x-8 gap-y-6">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <p className="eyebrow">03 / Tools</p>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-9">
            <MaskReveal className="h-section max-w-[16ch]">
              <h2>What I reach for.</h2>
            </MaskReveal>

            <dl className="mt-12">
              {skillGroups.map((g, i) => (
                <Reveal
                  key={g.label}
                  delay={i}
                  className="rule-t grid grid-cols-12 items-baseline gap-x-8 gap-y-2 py-5"
                >
                  <dt className="col-span-12 font-mono text-[11px] tracking-[0.12em] text-smoke uppercase sm:col-span-4">
                    {g.label}
                  </dt>
                  <dd className="col-span-12 font-mono text-[13px] leading-relaxed tracking-[0.02em] text-bone sm:col-span-8">
                    {g.items.join('   ·   ')}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
