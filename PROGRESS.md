# Design Loop — Progress

## Approved brand asset (user pick)

Higgsfield Nano Banana 2 (4K), reference-driven from the user's Dala
recording — job `c2e051ac-d4c1-4bdb-88ce-68ee7430fc93`, 4096×4096:
https://d8j0ntlcm91z4.cloudfront.net/user_3B4SowMRRlN831ChGVw7Ir1UWA1/hf_20260831_075011_c2e051ac-d4c1-4bdb-88ce-68ee7430fc93.png
Queued for when the Higgsfield connector is next attached: Seedance 2.5
hero intro loop (image + user's screen recording as motion references),
og-image derivation, and color-sampling this asset to tune the coded brain.

**Goal:** Cluster AI single-page site (second brain for business), built to the
bar of dala.craftedbygc.com/#manifesto with the Refero extended design system.

**Bar:** `bar.md` · **System:** `design-system.md` · **Reference access:** the
live Dala site is blocked by this environment's network policy, so the craft
critic judges against bar.md mechanisms instead of a blind A/B (declared in
preflight).

## Result: ALL THREE CRITICS PASS ✅

| Critic | Verdict | Round |
|--------|---------|-------|
| Brief (goal) | **PASS** | 3 |
| System (design-system.md) | **PASS** | 2 and 3 (re-verified) |
| Craft (bar.md, 7 mechanisms) | **PASS — 7/7** | 4 |

4 rounds, 10 critic runs total. Remaining craft notes are refinement-level
(logged below for the next iteration): amber sliver near the hero period,
brain could carry more multicolor, closing label enters high, platform
lower-right quadrant dead space.

## Gap history

**Round 1 → 2** (all three critics failed; converging gaps, all addressed):
- Conversion dead-end: three "Request access" pills, no visible capture →
  inline email form + confirmation state in closing; contact email in footer.
- Hero CTA scrolled over the transparent nav/logo; two violet pills per
  viewport → nav CTA demoted to white text link; soft black scrim under nav;
  exactly one pill per screen now.
- "Know everything." clipped at the 1440px edge → flipped split had its
  columns unswapped (7fr/5fr not mirrored); fixed to 5fr/7fr.
- Sections bled into each other (three ideas in one viewport) → story
  sections are now full-viewport, vertically centered.
- Tracking read near-default; body not airy enough → display tracking
  -0.045em + ss01, hero body white, body line-height 1.6.
- Brain read as fuzzy symmetric blob → gyri-band density clustering, hard
  shell bias, contour-emphasized rim (normal-based edge boost), deeper
  fissure, cerebellum, brainstem, 2100+ particles.
- Logo mark read as placeholder sliver → three-particle cluster mark
  (violet→teal), favicon updated to match.
- Manifesto dim state near-illegible → base word alpha 0.16 → 0.24.

**Round 2 → 3** (system PASS; brief FAIL on manifesto fold-clip; craft FAIL
on brain silhouette):
- Manifesto overflowed the pinned viewport, closing line unreadable →
  viewport-clamped type size; the full statement now fits at every capture.
- Brain read as clipped blob with a straight canvas edge → rebuilt from a
  side-profile brain silhouette polygon (frontal lobe, crown, occipital,
  cerebellum tuck, brainstem), shell-biased sampling, rim-emphasized
  contour, gentle sway instead of rotation, calmer twinkle, offset so it
  never clips or collides with the headline.
- Product claimed but never depicted → typographic ask→answer exchange in
  the platform section (no screenshots — system forbids them).
- Redundant eyebrow ("Your second brain" over "Unlock your second brain.")
  → "Introducing Cluster". Nav CTA copy differentiated ("Get access").
- Closing "Just ask Cluster." read as disabled gray → resolves amber.
- Logo mark still template-tier → angular shard + amber breakaway particle.
- Split columns locked to a shared cap line; form baseline aligned.

## R3F rebuild — brain quality pass (2026-08-31, session continuation)

"Screenshots look terrible" root-caused and fixed:

1. **Tone mapping** — R3F silently applies ACESFilmicToneMapping by
   default, washing the palette to pastel. Fixed with the `flat` prop on
   `<Canvas>` (NoToneMapping), per pmndrs/react-three-fiber#1547.
2. **True source pixels** — the 4K approved render now drives sampling.
   Egress blocks CloudFront locally, so `.github/workflows/
   fetch-brain-asset.yml` downloads it on a GitHub Actions runner and
   commits 512/1024 derivatives to the branch (commit cd8a480). The
   150px thumbnail placeholder is gone from both builds.
3. **Sampling now follows the artwork's light** (both builds):
   luminance-weighted keep (dark interior sparse, bright rim solid),
   hue normalization + snap toward brand tokens (iris/saffron/verdant),
   bimodal particle sizes (outlined triangles + solid chips),
   rim double-push thickening, 0.62 additive-alpha headroom so dense
   regions stay amber instead of clipping white; bloom retuned
   (0.4 / threshold 0.55).

Result: hero/manifesto/closing screenshots on the Next+R3F build now
carry the approved render's character — dark sparse interior, glowing
amber/violet rim, gold ventral band, brainstem. Vanilla backup carries
the same sampling upgrades (no bloom pipeline there by design).
Quality gate: React build judged at/above vanilla; formal /design-loop
run available on request.
