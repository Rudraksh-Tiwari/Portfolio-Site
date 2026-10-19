import { projectBySlug } from '../content/projects'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/primitives/Reveal'

/* Two rows on a 12-column grid. Row one is the two projects with full
   screenshots, cropped to one height so their text lines up. Row two mixes
   the diagram card with the two image-less cards, and all three show their
   bullet points so none is left half empty. */
const ROW_ONE = [
  { slug: 'taskq', span: 'md:col-span-7' },
  { slug: 'clarifi', span: 'md:col-span-5' },
]
const ROW_TWO = [
  { slug: 'diabetes-detection', span: 'md:col-span-12 lg:col-span-6', tags: 3 },
  { slug: 'credit-risk-engine', span: 'md:col-span-6 lg:col-span-3', tags: 2 },
  { slug: 'seatlock', span: 'md:col-span-6 lg:col-span-3', tags: 2 },
]

export default function Projects() {
  return (
    <div className="shell pt-16 pb-24 md:pt-18 md:pb-28">
      <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-bold tracking-[-0.03em]">Projects</h1>
      <p className="mt-4 mb-12 max-w-[56ch] text-[19px] leading-[1.6] text-muted">
        Five projects, each with a write-up of how it works and what went wrong along the way.
      </p>

      <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {ROW_ONE.map(({ slug, span }) => (
          <ProjectCard key={slug} project={projectBySlug(slug)!} fixedCover className={span} />
        ))}
      </Reveal>
      <Reveal className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
        {ROW_TWO.map(({ slug, span, tags }) => (
          <ProjectCard key={slug} project={projectBySlug(slug)!} points maxTags={tags} className={span} />
        ))}
      </Reveal>
    </div>
  )
}
