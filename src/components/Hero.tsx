import { Link } from 'react-router-dom'
import { ArrowRight, DownloadSimple } from '@phosphor-icons/react'
import photo from '../assets/photo.jpg'
import Reveal from './primitives/Reveal'
import { RESUME_FILENAME, RESUME_URL } from '../content/site'

export default function Hero() {
  return (
    <section className="shell pt-16 pb-20 md:pt-22 md:pb-24">
      <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] md:gap-16">
        <Reveal>
          <p className="mb-5 text-[16px] font-medium text-muted">Looking for a Software Engineer Intern role</p>
          <h1 className="text-[clamp(3rem,8vw,4.75rem)] leading-[1.02] font-bold tracking-[-0.035em]">
            Rudraksh Tiwari
          </h1>
          <p className="mt-6 max-w-[34ch] text-[clamp(1.15rem,2vw,1.375rem)] leading-[1.5]">
            Backend engineer and final-year CS student at NMIT, Bengaluru. I build systems that stay{' '}
            <em className="font-semibold text-accent italic">correct</em> when things crash.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/projects" className="btn btn-primary">
              View projects
              <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </Link>
            <a href={RESUME_URL} download={RESUME_FILENAME} className="btn btn-ghost">
              Résumé
              <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={2}>
          <img
            src={photo}
            alt="Rudraksh Tiwari on the NMIT campus"
            width={360}
            height={360}
            fetchPriority="high"
            className="aspect-square w-full max-w-[360px] rounded-2xl object-cover md:ml-auto"
          />
        </Reveal>
      </div>
    </section>
  )
}
