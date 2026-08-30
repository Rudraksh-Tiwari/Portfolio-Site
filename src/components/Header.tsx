import { Link, useLocation, useNavigate } from 'react-router-dom'
import { scrollToSection } from '../lib/smoothScroll'
import photo from '../assets/photo.jpg'

const NAV = [
  { id: 'work', label: 'Projects' },
  { id: 'skills', label: 'Tools' },
  { id: 'contact', label: 'Contact' },
]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onHome = pathname === '/'

  // From a case study, a nav click has to go home first and let the hash land.
  const go = (id: string) => {
    if (onHome) scrollToSection(id)
    else navigate(`/#${id}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 rule-b bg-ink/80 backdrop-blur-md">
      <div className="shell flex h-[79px] items-center justify-between">
        {/*
          The avatar lands here at the end of the intro animation (Stage 4).
          Keep the id and the box dimensions stable - the flight target is
          measured from this element.
        */}
        <Link
          to="/"
          id="avatar-slot"
          aria-label="Rudraksh Tiwari, home"
          onClick={() => { if (onHome) scrollToSection('top') }}
          className="block size-10 overflow-hidden rounded-full border border-signal"
        >
          <img src={photo} alt="Rudraksh Tiwari" className="size-full object-cover" />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5 sm:gap-9">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { e.preventDefault(); go(item.id) }}
              className="text-[13px] text-ash transition-colors duration-200 hover:text-bone"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            className="hidden rounded-[2px] border border-signal px-3 py-1.5 sm:inline-block font-mono text-[10px] tracking-[0.1em] text-signal uppercase transition-colors duration-200 hover:bg-signal hover:text-ink"
          >
            Résumé
          </a>
        </nav>
      </div>
    </header>
  )
}
