import { Link } from 'react-router-dom'
import type { Project, Tone } from '../content/projects'
import Reveal from './primitives/Reveal'
import MaskReveal from './primitives/MaskReveal'
import Counter from './primitives/Counter'
import Contention from '../demos/Contention'
import CategoryCollapse from '../demos/CategoryCollapse'
import ShapBars from '../demos/ShapBars'

const TONE: Record<Tone, string> = {
  signal: 'text-signal',
  won: 'text-won',
  fail: 'text-fail',
}

export function Status({ status }: { status: Project['status'] }) {
  if (!status) return null
  const live = status === 'live'
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase">
      <span className={`size-[5px] rounded-full ${live ? 'bg-won' : 'bg-smoke'}`} aria-hidden="true" />
      <span className={live ? 'text-won' : 'text-smoke'}>{live ? 'Live' : 'In progress'}</span>
    </span>
  )
}

export function DemoFor({ demo }: { demo: Project['demo'] }) {
  if (demo === 'contention') return <Contention />
  if (demo === 'category') return <CategoryCollapse />
  if (demo === 'shap') return <ShapBars />
  return null
}

/**
 * A project as a post: enough to judge it, the live demo, and a way through
 * to the full case study. The long-form writing lives at /work/<slug>.
 */
export default function ProjectPost({ project }: { project: Project }) {
  const { slug, index, title, status, subtitle, body, figures, stack, links, demo } = project

  return (
    <article className="rule-t grid grid-cols-12 gap-x-8 gap-y-5 py-14 md:py-18">
      <div className="col-span-12 md:col-span-3">
        <div className="flex items-center gap-4 md:sticky md:top-28 md:block md:space-y-3">
          <span className="figure block text-[12px] text-smoke">{index}</span>
          <Status status={status} />
        </div>
      </div>

      <div className="col-span-12 md:col-span-9">
        <MaskReveal className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.015em]">
          <h3>
            <Link to={`/work/${slug}`} className="transition-colors duration-200 hover:text-signal">
              {title}
            </Link>
          </h3>
        </MaskReveal>

        <Reveal delay={1}>
          <p className="mt-1.5 text-[15px] text-ash">{subtitle}</p>
        </Reveal>

        <Reveal delay={2}>
          <p className="mt-6 max-w-[62ch] text-[15.5px] leading-[1.65]">{body}</p>
        </Reveal>

        {demo && (
          <Reveal delay={3} className="rule-t mt-9 pt-7">
            <DemoFor demo={demo} />
          </Reveal>
        )}

        {figures.length > 0 && (
          <dl className="mt-9 flex flex-wrap gap-x-14 gap-y-7">
            {figures.map((f) => (
              <div key={f.value} className="max-w-[26ch]">
                <dt className={`figure text-[clamp(1.6rem,3vw,2.15rem)] leading-none ${TONE[f.tone]}`}>
                  <Counter value={f.value} />
                </dt>
                <dd className="mt-2 text-[12.5px] leading-snug text-smoke">{f.label}</dd>
              </div>
            ))}
          </dl>
        )}

        <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] tracking-[0.04em] text-smoke">
          {stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link
            to={`/work/${slug}`}
            className="border border-signal px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] text-signal uppercase transition-colors duration-200 hover:bg-signal hover:text-ink"
          >
            See more →
          </Link>
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="border-b border-rule pb-0.5 font-mono text-[12px] tracking-[0.05em] text-ash transition-colors duration-200 hover:border-bone hover:text-bone"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}
