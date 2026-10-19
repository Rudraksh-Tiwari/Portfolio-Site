import { EMAIL, GITHUB, LINKEDIN, RESUME_FILENAME, RESUME_URL } from '../content/site'

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-line bg-surface">
      <div className="shell py-20 md:py-24">
        <h2 className="text-[clamp(2rem,4vw,2.5rem)] font-bold tracking-[-0.02em]">Get in touch</h2>
        <p className="mt-4 max-w-[52ch] text-[18px] leading-[1.6] text-muted">
          I'm looking for a Software Engineer Intern role on a team that builds production systems.
        </p>
        <a
          href={`mailto:${EMAIL}`}
          className="mt-8 inline-block border-b-[3px] border-accent pb-1 text-[clamp(1.5rem,4vw,3rem)] font-bold tracking-[-0.02em] break-all transition-colors duration-200 hover:text-accent"
        >
          {EMAIL}
        </a>
        <div className="mt-9 flex flex-wrap gap-7 text-[16px]">
          <a className="txtlink" href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
          <a className="txtlink" href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="txtlink" href={RESUME_URL} download={RESUME_FILENAME}>Résumé</a>
        </div>
      </div>
    </section>
  )
}
