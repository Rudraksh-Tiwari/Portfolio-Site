import { Link } from 'react-router-dom'
import type { Project } from '../content/projects'

interface Props {
  project: Project
  className?: string
  /** Large home-page card: adds the bullet points and the first two figures. */
  feature?: boolean
  /** Show the bullet points (used where the card would otherwise leave empty space). */
  points?: boolean
  /** Crop the cover to a fixed height so cards in one row line up. */
  fixedCover?: boolean
  /** Show the dates/status line above the title. */
  meta?: boolean
  maxTags?: number
}

export default function ProjectCard({
  project,
  className = '',
  feature = false,
  points = false,
  fixedCover = false,
  meta = true,
  maxTags = 3,
}: Props) {
  const { slug, title, brand, status, image, panel, summary, stack, figures } = project
  const shown = stack.slice(0, maxTags)
  const extra = stack.length - shown.length

  return (
    <Link to={`/projects/${slug}`} className={`card ${className}`}>
      {image ? (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          style={image.position ? { objectPosition: image.position } : undefined}
          className={`block w-full border-b border-line bg-white ${
            // The feature card's screenshot takes whatever height the stacked
            // cards beside it leave over, so the card never has a dead gap.
            feature
              ? 'aspect-video object-cover md:aspect-auto md:h-0 md:min-h-[300px] md:flex-1'
              : fixedCover
                ? 'h-[240px] object-cover'
                : image.height / image.width < 0.5
                  ? 'h-auto'
                  : 'aspect-video object-cover'
          }`}
        />
      ) : panel ? (
        <div
          className={`flex flex-col gap-1 px-7 py-6 ${
            status === 'wip' ? 'border-b border-dashed border-line' : 'bg-btn text-btn-fg'
          }`}
        >
          <span className={`text-[44px] leading-none font-bold tracking-[-0.03em] ${status === 'wip' ? 'text-accent' : ''}`}>
            {panel.value}
          </span>
          <span className={`text-[14px] font-medium ${status === 'wip' ? 'text-muted' : ''}`}>{panel.label}</span>
        </div>
      ) : null}

      <div className={`flex flex-col gap-3 ${feature ? 'p-7 md:p-8' : 'grow px-7 pt-6 pb-7'}`}>
        {meta && <span className="text-[14px] text-muted">{project.meta}</span>}
        <div className="flex flex-wrap items-center gap-3">
          <h3
            translate={brand ? 'no' : undefined}
            className={`font-bold tracking-[-0.02em] ${feature ? 'text-[32px]' : panel ? 'text-[22px]' : 'text-[26px]'}`}
          >
            {title}
          </h3>
          {status === 'live' && !meta && (
            <span className="rounded-[10px] bg-btn px-2.5 py-0.5 text-[13px] font-semibold text-btn-fg">Live</span>
          )}
        </div>
        <p className={`leading-[1.6] ${feature ? 'max-w-[56ch] text-[17px]' : 'text-[16px]'}`}>{summary}</p>

        {(feature || points) && project.points.length > 0 && (
          <ul className={`points ${feature ? 'text-[16px]' : 'text-[15px]'}`}>
            {project.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {feature && figures.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-10">
            {[figures[0], figures[3] ?? figures[1]].filter(Boolean).map((f) => (
              <div key={f.value}>
                <div className="text-[40px] leading-none font-bold text-accent">{f.value}</div>
                <div className="mt-1.5 text-[14px] text-muted">{f.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {shown.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
          {extra > 0 && <span className="tag">+{extra}</span>}
        </div>
      </div>
    </Link>
  )
}
