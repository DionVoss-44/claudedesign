# Cluster AI — Design System
> constellation floating on black velvet

**Theme:** dark (single theme, deliberately committed)

Cluster AI is the second brain for any business — an intelligent, real-time
source of truth. The site is a dark-stage environment where a pure black void
meets a single vivid violet accent, punctuated by amber sparks. Typography is
monolithic and weightless. The signature visual is a constellation of tiny
multicolored triangular particles forming an organic brain shape: knowledge
visualized as distributed intelligence.

Derived from the Refero "extended" extraction of dala.craftedbygc.com
(see `design-system/` for the verbatim source files: DESIGN.md, tokens.json,
variables.css, theme.css).

## Colors

| Name | Value | Role |
|------|-------|------|
| Void | `#000000` | Page canvas, every section background, negative space. Pure black — never dark gray. |
| Bone White | `#ffffff` | Headlines, body text, icon fills, nav active state — the only typographic color carrying maximum hierarchy. |
| Ash Gray | `#9a9a9a` | Muted nav text, ghost links, secondary labels. |
| Silver Mist | `#bdbdbd` | Tertiary body text, captions. |
| Electric Iris | `#8052ff` | Primary action buttons, logo mark, brand accents. The ONLY saturated button color. |
| Saffron Spark | `#ffb829` | Uppercase section labels, inline emphasis, accent links. Rationed. |
| Deep Verdant | `#15846e` | Logo gradient stop, subtle accent washes only. Never a surface. |

## Typography

Single typeface: **PPNeueMontreal**, substitute **Inter** (self-hosted).
Hierarchy comes from scale, never weight.

- Display/headlines: weight **400**, sizes 42/48/78/113px, line-height 0.9–1.1,
  tracking **-0.04em** on everything ≥42px.
- Body: 18px weight **200** (ultra-light — signature choice), line-height 1.5.
- Nav & labels: 14px weight **600**, uppercase, tracking 0.025em (0.35px).
- Caption: 12px weight 400, line-height 1.5.

| Role | Size | Line height | Tracking |
|------|------|-------------|----------|
| caption | 12px | 1.5 | — |
| nav-label | 14px | 1.2 | 0.35px |
| body | 18px | 1.5 | — |
| heading-2xs | 24px | 1.25 | -0.48px |
| heading-xs | 27px | 1.0 | — |
| subheading | 36px | 1.2 | — |
| heading-sm | 42px | 1.2 | -1.68px |
| heading | 48px | 1.1 | -1.68px |
| heading-lg | 78px | 1.1 | -3.12px |
| display | 113px | 1.1 | -4.52px |

## Spacing & Shape

- Base unit **6px**; scale: 6, 12, 18, 24, 30, 36, 60, 96, 120.
- Page max-width **1280px**, centered.
- Section gap **60–120px**. Card padding 24–38px. Element gap 6–18px.
- Border radius: **24px** for buttons/cards/nav; **9999px** (pill) only at very
  small sizes. Primary CTA is a full pill (~22.5px radius on ~45px height).
- **No shadows. No elevation. No borders or dividers.** Hierarchy is scale,
  color contrast, and whitespace on flat black.

## Components

- **Primary button** — filled `#8052ff` pill, white 14px weight-600 uppercase
  text, ~14px vertical × 16px horizontal padding. One per view.
- **Ghost link** — bare text, `#ffffff` or `#9a9a9a`, no container.
- **Nav bar** — transparent on black. Logo left (violet→teal triangular mark +
  "Cluster" wordmark in white), links center/right at 14px weight-600 uppercase
  `#9a9a9a` (inactive) / `#ffffff` (active), violet pill CTA far right. No
  border, no blur.
- **Section headline block** — two-column asymmetric: oversized left-aligned
  weight-400 headline; 18px weight-200 body (max-width ~520px) in white or
  silver; small amber uppercase label above the body. No boxes.
- **Particle constellation** — thousands of tiny outlined triangles (1–2px
  stroke) in violet/amber/teal/magenta/blue forming an organic brain shape,
  animated; ambient particles drift sparsely elsewhere. This IS the brand
  imagery — no photos, no screenshots, no 3D renders.

## Do

- Use `#8052ff` exclusively for filled action buttons.
- Set every headline weight 400 — never bold.
- Set 18px body at weight 200.
- Keep every section background `#000000`.
- Track display type -0.04em at ≥42px.
- Use 24px radius for rounded elements.
- Let the particle constellation be the only hero imagery.

## Don't

- No violet as a large surface or section background.
- No weight-400 body text.
- No card containers with borders, shadows, or fills.
- No `#0000ee` browser-blue links — links are amber or white.
- No gradients on UI components (logo and particles only).
- No multiple filled buttons in proximity.
- No photography, illustration, or product screenshots.

## Voice

Confident, calm, second-person. Short declaratives ("Stop managing knowledge.
Start using it."). The product is a colleague you ask, not software you
operate. Brand line: **"Your business has the answer. Just ask Cluster."**
