import { Link, useParams } from 'react-router-dom'
import { projectBySlug, type Tone } from '../content/projects'
import { Status, DemoFor } from '../components/ProjectPost'
import Reveal from '../components/primitives/Reveal'
import MaskReveal from '../components/primitives/MaskReveal'
import Counter from '../components/primitives/Counter'

const TONE: Record<Tone, string> = {
  signal: 'text-signal',
  won: 'text-won',
  fail: 'text-fail',
}

export default function CaseStudy() {
  const { slug } = useParams()
  const project = slug ? projectBySlug(slug) : undefined

  if (!project) {
    return (
      <div className="shell pt-40 pb-32">
        <h1 className="h-section">No such project.</h1>
        <Link
          to="/"
          className="mt-8 inline-block border-b border-signal pb-0.5 font-mono text-[12px] tracking-[0.06em] text-signal uppercase"
        >
          ← Back to the work
        </Link>
      </div>
    )
  }

  const { title, subtitle, status, note, figures, stack, links, timeline, caseStudy, demo } = project

  return (
    <article className="shell pt-32 pb-24 md:pt-40">
      <Link
        to="/#work"
        className="font-mono text-[11px] tracking-[0.1em] text-smoke uppercase transition-colors duration-200 hover:text-bone"
      >
        ← All work
      </Link>

      <header className="mt-10">
        <MaskReveal className="h-display text-[clamp(2.75rem,7vw,5rem)]">
          <h1>{title}</h1>
        </MaskReveal>
        <Reveal delay={1}>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[16px] text-ash">{subtitle}</p>
            <Status status={status} />
          </div>
        </Reveal>
      </header>

      {demo && (
        <Reveal delay={2} className="rule-t mt-12 pt-8">
          <DemoFor demo={demo} />
        </Reveal>
      )}

      {figures.length > 0 && (
        <dl className="rule-t mt-10 flex flex-wrap gap-x-14 gap-y-7 pt-9">
          {figures.map((f) => (
            <div key={f.value} className="max-w-[26ch]">
              <dt className={`figure text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none ${TONE[f.tone]}`}>
                <Counter value={f.value} />
              </dt>
              <dd className="mt-2 text-[12.5px] leading-snug text-smoke">{f.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {note && (
        <p className="mt-8 max-w-[62ch] border-l border-rule pl-4 font-mono text-[12px] leading-[1.7] text-smoke">
          {note}
        </p>
      )}

      <div className="mt-4">
        {caseStudy.map((section) => (
          <section key={section.heading} className="rule-t mt-12 grid grid-cols-12 gap-x-8 gap-y-4 pt-9">
            <div className="col-span-12 md:col-span-3">
              <Reveal>
                <h2 className="eyebrow md:sticky md:top-28">{section.heading}</h2>
              </Reveal>
            </div>
            <div className="col-span-12 space-y-5 md:col-span-9">
              {section.body.map((p, i) => (
                <Reveal key={i} delay={i}>
                  <p className="max-w-[68ch] text-[15.5px] leading-[1.7] text-ash">{p}</p>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rule-t mt-12 grid grid-cols-12 gap-x-8 gap-y-4 pt-9">
        <div className="col-span-12 md:col-span-3">
          <h2 className="eyebrow">Stack</h2>
        </div>
        <div className="col-span-12 md:col-span-9">
          <p className="font-mono text-[12.5px] leading-relaxed tracking-[0.03em] text-bone">
            {stack.join('   ·   ')}
          </p>
          {timeline && (
            <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-smoke">{timeline}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
            {links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={`border-b pb-0.5 font-mono text-[12px] tracking-[0.05em] transition-colors duration-200 ${
                  l.primary
                    ? 'border-signal text-signal hover:border-bone hover:text-bone'
                    : 'border-rule text-ash hover:border-bone hover:text-bone'
                }`}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="rule-t mt-14 pt-10">
        <Link
          to="/#work"
          className="border border-signal px-4 py-2.5 font-mono text-[11px] tracking-[0.1em] text-signal uppercase transition-colors duration-200 hover:bg-signal hover:text-ink"
        >
          ← All work
        </Link>
      </div>
    </article>
  )
}
