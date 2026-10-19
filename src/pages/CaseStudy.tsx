import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowUpRight } from '@phosphor-icons/react'
import { legacySlugs, projectBySlug, projects, type Project } from '../content/projects'
import Counter from '../components/primitives/Counter'
import Reveal from '../components/primitives/Reveal'
import NotFound from './NotFound'
import Contention from '../demos/Contention'
import CategoryCollapse from '../demos/CategoryCollapse'
import ShapBars from '../demos/ShapBars'

const DEMO_TEXT: Record<NonNullable<Project['demo']>, string> = {
  contention:
    'Animation: twelve workers race to claim 45 jobs. Each job is claimed exactly once, because the claim is atomic.',
  category:
    'Animation: one spending bar flips between the broken categoriser, with 87% in a single UPI bucket, and the fixed breakdown.',
  shap: 'Animation: SHAP bars for three sample applicants, ending in approved, flagged for review and rejected.',
}

function Demo({ demo }: { demo: NonNullable<Project['demo']> }) {
  return (
    // The canvases are drawn for a dark ground, so the panel stays chocolate
    // in both themes.
    <figure className="my-10 rounded-2xl bg-[#2A1A08] px-6 pt-6 pb-5">
      {demo === 'contention' && <Contention />}
      {demo === 'category' && <CategoryCollapse />}
      {demo === 'shap' && <ShapBars />}
      <figcaption className="mt-4 text-[14px] leading-[1.5] text-[#D9CCAA]">{DEMO_TEXT[demo]}</figcaption>
    </figure>
  )
}

const anchor = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function LegacyWorkRedirect() {
  const { slug = '' } = useParams()
  return <Navigate to={`/projects/${legacySlugs[slug] ?? slug}`} replace />
}

export default function CaseStudy() {
  const { slug } = useParams()
  const project = slug ? projectBySlug(slug) : undefined
  if (!project) return <NotFound />

  const { title, brand, subtitle, image, figures, links, caseStudy, demo, role, timeline, stack } = project
  const next = projects[(projects.indexOf(project) + 1) % projects.length]

  return (
    <article className="shell pt-12 pb-24 md:pb-28">
      <Link to="/projects" className="txtlink text-[15px]">Back to projects</Link>

      <header className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1
            translate={brand ? 'no' : undefined}
            className="text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] font-bold tracking-[-0.035em]"
          >
            {title}
          </h1>
          <p className="mt-3 max-w-[46ch] text-[clamp(1.1rem,2vw,1.3rem)] leading-[1.5] text-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {links.map((l, i) => (
            <a
              key={l.href + l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={`btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}
            >
              {l.label}
              <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
          ))}
        </div>
      </header>

      {image && (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          className="mt-10 block h-auto w-full max-w-[960px] rounded-2xl border border-line bg-white"
        />
      )}

      {figures.length > 0 && (
        <dl className="mt-12 grid grid-cols-2 gap-8 border-b border-line pb-12 md:grid-cols-4">
          {figures.map((f) => (
            <div key={f.value}>
              <dt className="text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-bold text-accent">
                <Counter value={f.value} />
              </dt>
              <dd className="mt-2 text-[15px] leading-snug text-muted">{f.label}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-16 grid gap-16 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] md:gap-18">
        <div className="prose-cs">
          {caseStudy.map((section, i) => (
            <section key={section.heading}>
              <h2 id={anchor(section.heading)}>{section.heading}</h2>
              {section.body.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
              {i === 1 && demo && <Demo demo={demo} />}
            </section>
          ))}
        </div>

        <aside className="flex flex-col gap-8 text-[16px] md:sticky md:top-28 md:self-start">
          <div>
            <h2 className="mb-2.5 text-[15px] font-semibold text-muted">Role</h2>
            <p className="font-semibold">{role}</p>
          </div>
          <div>
            <h2 className="mb-2.5 text-[15px] font-semibold text-muted">Timeline</h2>
            <p className="font-semibold">{timeline}</p>
          </div>
          <div>
            <h2 className="mb-3 text-[15px] font-semibold text-muted">Stack</h2>
            <ul className="flex flex-wrap gap-2">
              {stack.map((t) => (
                <li key={t} className="tag text-fg">{t}</li>
              ))}
            </ul>
          </div>
          <nav aria-label="On this page" className="hidden md:block">
            <h2 className="mb-2.5 text-[15px] font-semibold text-muted">On this page</h2>
            <ul className="flex flex-col gap-2 font-medium">
              {caseStudy.map((s) => (
                <li key={s.heading}>
                  <a href={`#${anchor(s.heading)}`} className="transition-colors duration-200 hover:text-accent">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <Reveal className="mt-22 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-10">
        <span className="text-[15px] text-muted">Next project</span>
        <Link
          to={`/projects/${next.slug}`}
          translate={next.brand ? 'no' : undefined}
          className="border-b-[3px] border-accent text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em] transition-colors duration-200 hover:text-accent"
        >
          {next.title}
        </Link>
      </Reveal>
    </article>
  )
}
