import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { List, X } from '@phosphor-icons/react'
import photo from '../assets/photo.jpg'
import { RESUME_FILENAME, RESUME_URL } from '../content/site'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/experience', label: 'Experience' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
    isActive ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
  }`

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <nav aria-label="Primary" className="shell flex min-h-[72px] items-center justify-between gap-4">
        {/*
          The intro animation flies the avatar into this element and measures
          it to land - keep the id and the 36px box stable.
        */}
        <Link to="/" className="flex items-center gap-3 text-[17px] font-bold">
          <span id="avatar-slot" className="block size-9 shrink-0 overflow-hidden rounded-full">
            <img src={photo} alt="" width={36} height={36} className="size-full object-cover" />
          </span>
          <span>Rudraksh Tiwari</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <a href={RESUME_URL} download={RESUME_FILENAME} className="btn btn-primary min-h-10 px-4 text-[14px]">
            Résumé
          </a>
        </div>

        <button
          type="button"
          className="-mr-2 grid size-11 place-items-center rounded-[10px] md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="shell flex flex-col gap-1 border-t border-line pt-2 pb-5 md:hidden">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <a href={RESUME_URL} download={RESUME_FILENAME} className="btn btn-primary mt-3 self-start">
            Résumé
          </a>
        </div>
      )}
    </header>
  )
}
