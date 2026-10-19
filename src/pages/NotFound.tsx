import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="shell pt-24 pb-32">
      <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] font-bold tracking-[-0.03em]">Page not found</h1>
      <p className="mt-4 max-w-[52ch] text-[18px] leading-[1.6] text-muted">
        That link doesn't point to anything here. The projects page lists everything on the site.
      </p>
      <Link to="/projects" className="btn btn-primary mt-8">See all projects</Link>
    </div>
  )
}
