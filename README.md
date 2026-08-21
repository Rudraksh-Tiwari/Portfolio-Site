# rudrakshtiwari.com

Personal site. Three files, no build step, no dependencies.

```
index.html    the whole page
style.css     the whole design
resume.pdf    swap this file to update the résumé link
```

## Run it locally

Any static server will do:

```bash
python -m http.server 4321
```

Then open <http://localhost:4321>.

## Deploy

Pushed to `main`, Vercel builds and deploys automatically — there is no build
command, it just serves the directory.

## Editing

Projects live in `<article class="project">` blocks in `index.html`. Copy one to
add another. The `.tag` span is optional; `.tag-live` is the green "Live" variant.

Colours are CSS custom properties at the top of `style.css`, defined once for
light and overridden in the `prefers-color-scheme: dark` block. Change them in
those two places and the whole page follows.
