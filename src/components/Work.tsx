import { projects } from '../content/projects'
import ProjectPost from './ProjectPost'
import Reveal from './primitives/Reveal'
import MaskReveal from './primitives/MaskReveal'

export default function Work() {
  return (
    <section id="work" className="scroll-mt-20">
      <div className="shell rule-t pt-20 pb-0 md:pt-24 md:pb-0">
        <div className="grid grid-cols-12 gap-x-8 gap-y-6">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <p className="eyebrow">Projects</p>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-9">
            <MaskReveal className="h-section max-w-[18ch]">
              <h2>Four systems, and the hard part of each.</h2>
            </MaskReveal>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          {projects.map((p) => (
            <ProjectPost key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
