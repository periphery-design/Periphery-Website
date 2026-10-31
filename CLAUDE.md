# Periphery Website — T. Anderson creative portfolio

## Project brief
A creative portfolio site. Work is being built in phases:
1. **Now:** function, structure, wireframes and interaction/animation. Greyscale placeholders only.
2. **Later:** real colour, fonts (free Google Fonts the owner will upload), final logo, domain.

Content source: the owner's Behance (behance.net/TandersonCreative), first 5 projects to start.
Prefer original high-res images supplied by the owner over images scraped from Behance.

### Reference sites and what to take from each
- **nonstopbrandingagency.com** — dark mode, scroll feel, hover states, collapsing/expanding text panels.
- **wearecollins.com** — clean simplicity, rounded corners on images/cards, minimal hover animations,
  typography, rollover animation on the list of programs/services.
- **spiegeldesign.co** — clean typography, work shown high on the page, "capabilities" rollover, process section.

Take patterns and principles from these, never copy their code, copy, or assets.

### Open decisions (ask the owner, don't assume)
Framework/host, domain, fonts, colour palette, logo — see the running decision log in `docs/decisions.md` once it exists.

## Which skill to use (there are ~79 installed; pick one per job)
| Job | Use | Not |
|---|---|---|
| Art direction, building pages | `taste-skill` (design-taste-frontend) | frontend-design, design, huashu-design |
| Critique / polish an existing page | `impeccable` (critique, polish, audit, bolder, quieter, typeset) | critique-* skills unless asked for one specific lens |
| Any motion or animation | Emil's skills: `animate`, `review-animations`, `improve-animations`, `animation-performance` | impeccable animate, animation-principles |
| Edge-case stress test | `break-ui` | — |
| Looking up palettes, font pairings, styles | `ui-ux-pro-max` (search script) | — |
| Project case-study text | `case-study` / `/write-case-study`, `ux-writing` for microcopy | portfolio-showcase-generator (built for software projects) |
| Type scale, spacing, grid | `typography-scale`, `spacing-system`, `layout-grid` | — |
| Video / motion export, slide decks | `huashu-design` (instructions in Chinese; reply in English) | — |

Don't run more than one design-direction skill on the same request. If two seem to apply, ask.

## Working rules
- Accessibility: respect `prefers-reduced-motion`; hover-only interactions need a keyboard/touch equivalent.
- Every hover effect needs a sensible mobile (touch) behaviour.
- Commit to `main` only when the owner says so; otherwise use a branch.
