# rudraksht.tech

Personal site. Vite + React + TypeScript + Tailwind v4, deployed on Vercel.

```
src/content/      all copy: projects.ts, experience.ts, skills.ts, site.ts (links, email, résumé path)
src/components/   header, footer, home sections, project card, the intro sequence
src/demos/        the live canvas simulations embedded in case studies
src/pages/        Home, Projects, the per-project case study, Experience
src/lib/          scroll restoration, the shared viewport check
public/images/    project cover screenshots
public/Rudraksh_Tiwari_Resume.pdf   swap this file to update the résumé
legacy/           the original hand-written static site, kept for reference
```

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Routes

| Path | Page |
|---|---|
| `/` | Home: intro, about, selected work, skills, contact |
| `/projects` | All projects |
| `/projects/<slug>` | Case study |
| `/experience` | Work, education, achievements |

Old `/work/<slug>` links redirect to `/projects/<slug>`, and `/resume.pdf`
redirects to the current résumé (see `vercel.json`).

## Editing content

Projects live in `src/content/projects.ts`. Each one carries its card summary
and bullet points, figures, stack, cover image (or a headline `panel` number
for projects without a screenshot) and the long-form `caseStudy` sections.
Nothing about a project is hard-coded into a component.

Copy rules: no em dashes anywhere, and date ranges use a plain hyphen
(`2025-2026`). Every figure should match the résumé.

## Design

Colours come from Figma's "Chocolate truffle" combination and are defined once
at the top of `src/styles/globals.css`: a cream light theme and a chocolate
dark theme, picked by the visitor's system setting. Type is Hanken Grotesk,
self-hosted, chosen partly because its zero has no dot or slash.

The canvas demos are drawn for a dark ground, so they sit on a fixed
deep-chocolate panel in both themes.

## A note on the reveals

Sections fade in on scroll, but the hidden starting state is only applied once
JS adds `.reveals-armed` to `<html>`. If the bundle fails, the page renders
plain and fully readable rather than blank. `src/lib/viewport.ts` backs this
with a 250ms poll that does not depend on `requestAnimationFrame`.
