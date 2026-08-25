# rudraksht.tech

Personal site. Vite + React + TypeScript + Tailwind v4, deployed on Vercel.

```
src/content/      all copy — projects.ts and skills.ts. Edit text here, not in components.
src/components/   header, hero, project posts, skills, contact, the intro sequence
src/demos/        the live canvas simulations, one file each
src/pages/        Home and the per-project case study
src/lib/          smooth scroll, scroll restoration, the shared viewport check
public/resume.pdf swap this file to update the résumé link
legacy/           the previous hand-written static site, kept for reference
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

## Editing content

Projects live in `src/content/projects.ts`. Each one carries its post blurb, the
figures, the stack, and the long-form `caseStudy` sections rendered at
`/work/<slug>`. Nothing about a project is hard-coded into a component.

A project only gets a `figures` entry for a number that has actually been
measured, and only gets a `demo` when the code behind it does what the demo
shows. SeatLock has neither until its locking layer is written.

## Design

Colours and fonts are defined once in the `@theme` block at the top of
`src/styles/globals.css`. Cyan is reserved for "succeeded" states in the demos
and is never decorative.

## A note on the reveals

Everything animates in on scroll, but the hidden starting state is only applied
once JS adds `.reveals-armed` to `<html>`. If the bundle fails, the page renders
plain and fully readable rather than blank. `src/lib/viewport.ts` backs this
with a 250ms poll that does not depend on `requestAnimationFrame`.
