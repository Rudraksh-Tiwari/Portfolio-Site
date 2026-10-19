import { award, certifications, education, work } from '../content/experience'
import Reveal from '../components/primitives/Reveal'

function Row({ period, children }: { period: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-line py-9 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div className="text-[15px] font-semibold text-muted">{period}</div>
      <div>{children}</div>
    </div>
  )
}

export default function Experience() {
  return (
    <div className="shell pt-16 pb-24 md:pt-18 md:pb-28">
      <h1 className="mb-12 text-[clamp(2.5rem,6vw,3.5rem)] font-bold tracking-[-0.03em]">Experience</h1>

      <section aria-labelledby="work-h">
        <h2 id="work-h" className="mb-2 text-[26px] font-bold">Work</h2>
        {work.map((r) => (
          <Row key={r.title} period={r.period}>
            <h3 className="text-[22px] font-bold">{r.title}</h3>
            <p className="mt-1 text-[17px] text-muted">{r.org}</p>
            <p className="mt-3.5 max-w-[64ch] text-[17px] leading-[1.7]">{r.body}</p>
          </Row>
        ))}
      </section>

      <section aria-labelledby="edu-h" className="mt-16">
        <h2 id="edu-h" className="mb-2 text-[26px] font-bold">Education</h2>
        {education.map((s) => (
          <Row key={s.name} period={s.period}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[22px] font-bold">{s.name}</h3>
              {s.score && (
                <span className="text-[28px] font-bold text-accent">
                  {s.score.value} <span className="text-[16px] font-medium text-muted">{s.score.label}</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-[17px] text-muted">{s.detail}</p>
            <p className="mt-3.5 max-w-[64ch] text-[17px] leading-[1.7]">{s.body}</p>
          </Row>
        ))}
      </section>

      <section aria-labelledby="ach-h" className="mt-16">
        <h2 id="ach-h" className="mb-6 text-[26px] font-bold">Achievements and certifications</h2>
        <Reveal className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-btn p-9 text-btn-fg">
            <div className="text-[15px] font-semibold">{award.year}</div>
            <div className="mt-2.5 text-[32px] leading-[1.15] font-bold tracking-[-0.02em]">{award.title}</div>
            <p className="mt-3 text-[16px] leading-[1.6]">{award.body}</p>
          </div>
          <ul className="flex flex-col gap-4.5 rounded-2xl border border-line bg-surface p-9 text-[16px] leading-[1.5]">
            {certifications.map((c) => (
              <li key={c.issuer}>
                <div className="font-bold">{c.issuer}</div>
                <div className="text-muted">{c.items}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  )
}
