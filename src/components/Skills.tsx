import { skillGroups } from '../content/skills'
import Reveal from './primitives/Reveal'

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 border-t border-line">
      <div className="shell py-18 md:py-22">
        <h2 className="mb-10 text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">Skills</h2>
        <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          {skillGroups.map((g, i) => (
            <Reveal key={g.label} delay={i}>
              <h3 className="mb-3.5 text-[18px] font-bold">{g.label}</h3>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s} className="tag">{s}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
