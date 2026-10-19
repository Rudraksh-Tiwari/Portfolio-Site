import { Link } from 'react-router-dom'
import { projectBySlug } from '../content/projects'
import ProjectCard from './ProjectCard'
import Reveal from './primitives/Reveal'

export default function SelectedWork() {
  const taskq = projectBySlug('taskq')!
  const clarifi = projectBySlug('clarifi')!
  const diabetes = projectBySlug('diabetes-detection')!

  return (
    <section id="work" className="scroll-mt-24 border-t border-line">
      <div className="shell py-18">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">Selected work</h2>
          <Link to="/projects" className="txtlink">All five projects</Link>
        </div>

        {/* One large card and two stacked. The large card carries its bullet
            points so it fills the height of the two beside it. */}
        <Reveal className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <ProjectCard project={taskq} feature meta={false} maxTags={4} className="md:row-span-2" />
          <ProjectCard project={clarifi} meta={false} />
          <ProjectCard project={diabetes} meta={false} />
        </Reveal>
      </div>
    </section>
  )
}
