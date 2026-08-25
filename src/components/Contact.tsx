import Reveal from './primitives/Reveal'
import MaskReveal from './primitives/MaskReveal'
import Magnetic from './primitives/Magnetic'

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/Rudraksh-Tiwari' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rudraksh-tiwari-rt/' },
  { label: 'Résumé ↓', href: '/resume.pdf' },
]

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-20">
      <div className="shell rule-t py-20 md:py-28">
        <div className="grid grid-cols-12 gap-x-8 gap-y-6">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <p className="eyebrow">04 / Contact</p>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-9">
            <MaskReveal className="h-section max-w-[18ch]">
              <h2>Open to software engineering roles.</h2>
            </MaskReveal>

            <Reveal delay={2}>
            <Magnetic strength={0.25}>
            <a
              href="mailto:rudraksh78779@gmail.com"
              className="mt-10 inline-block border-b border-rule pb-2 font-mono text-[clamp(1.05rem,3vw,1.9rem)] tracking-[-0.01em] text-bone transition-colors duration-200 hover:border-signal hover:text-signal"
            >
              rudraksh78779@gmail.com
            </a>
            </Magnetic>
            </Reveal>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="border-b border-rule pb-0.5 font-mono text-[12px] tracking-[0.05em] text-ash transition-colors duration-200 hover:border-bone hover:text-bone"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
