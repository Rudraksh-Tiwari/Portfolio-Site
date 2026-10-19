import Reveal from './primitives/Reveal'

const FACTS = [
  { label: 'Studying', value: 'B.E. Computer Science, NMIT, 2023-2027' },
  { label: 'CGPA', value: '8.32 / 10' },
  { label: 'Graduating', value: 'June 2027' },
  { label: 'Based in', value: 'Bengaluru, India' },
  { label: 'Recognition', value: 'Runner-up, Coding Battles 2024' },
]

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-line">
      <div className="shell py-18 md:py-22">
        <h2 className="mb-8 text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">About</h2>
        <div className="grid gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          <Reveal className="flex max-w-[62ch] flex-col gap-5 text-[18px] leading-[1.7]">
            <p>
              I'm in my final year of Computer Science and Engineering at Nitte Meenakshi Institute of Technology.
              Most of what I build is backend work, and the part I care about is correctness: what happens to a job
              when the worker running it dies, or to a booking when two people click at once.
            </p>
            <p>
              The project I'm proudest of is <span translate="no">taskq</span>, a task queue I wrote from scratch on
              Redis. A chaos test kills workers in the middle of jobs, and all 600 jobs still finish. I also built{' '}
              <span translate="no">Clarifi</span>, a fintech app on AWS that reads real Indian bank statements.
            </p>
            <p>
              Outside code, I listen to a lot of music and pick things up out of curiosity. I once downloaded Blender
              on a whim and started teaching myself 3D modelling. I also check in on my stocks every day.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <dl className="grid grid-cols-[auto_1fr] content-start gap-x-7 gap-y-4 text-[16px]">
              {FACTS.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
