# Cluster AI — marketing site

A single-page site for **Cluster AI**, the second brain for any business —
built with the design-loop method (see `design-loop.md` and the
[Jack Roberts video](https://www.youtube.com/watch?v=VwGrXe2ricE) transcript
in `Jack Roberts.md`) against the bar of
[dala.craftedbygc.com](https://dala.craftedbygc.com) and the Refero
"extended" design-token extraction of that site.

## Run it

Everything is self-contained — no build step, no network needed:

```
python3 -m http.server 8000
# open http://localhost:8000/
```

Or just open `index.html` in a browser.

## What's here

| Path | What it is |
|------|------------|
| `index.html` | The site: hero with procedural particle-brain, problem section, pinned scroll-reveal manifesto (`#manifesto`), platform section with ask→answer vignette, email-capture closing |
| `design-system.html` | Rendered styleguide: colors, type scale, components, spacing |
| `design-system.md` | The written Cluster AI design system (critic rulebook) |
| `design-system/` | Verbatim Refero extended export: `DESIGN.md`, `tokens.json`, `variables.css`, `theme.css` |
| `bar.md` | 7 checkable mechanisms extracted from the Dala reference |
| `PROGRESS.md` | Design-loop round log: critic verdicts and gap history |
| `assets/` | Tokens CSS, styles, particle system, scroll choreography, vendored Inter/GSAP/Lenis |

## Fonts and licensing

The reference typeface is **PP Neue Montreal** (Pangram Pangram) — a
**commercial** font that is not bundled here. The site ships with **Inter**
(SIL Open Font License, free for commercial use), the substitute the design
system specifies, self-hosted in `assets/fonts/`.

To upgrade to the real thing: license PP Neue Montreal weights 200/400/600
from pangrampangram.com, drop the `.woff2` files into `assets/fonts/`, and
add matching `@font-face` rules named `PPNeueMontreal` to
`assets/css/tokens.css`. The font stack already lists `'PPNeueMontreal'`
first, so it takes over the moment the files exist. Always check the license
covers web embedding before deploying.

## Placeholders to replace before launch

- `hello@cluster.ai` (footer + form destination) — swap for your real domain
  and wire the form to your waitlist backend or CRM.
- The email form is front-end only: it validates and confirms, but stores
  nothing. Point its submit handler (in `assets/js/main.js`) at your API.
