# Reference research (wireframe v1)

## nonstopbrandingagency.com
- Built with Astro + Lenis smooth scroll (same stack as this site).
- Near-black background (#060606), light grey text, one sans (GT America) at small sizes; big type only for the wordmark.
- Two-column split: small grey labels on the left half, all content starting at the middle.
- Featured work is a sticky stack: each project pins and the next slides over, leaving earlier titles as thin strips.
- FAQs are plus/minus accordions with hairline dividers. Oversized 3D wordmark in the hero and footer.

## wearecollins.com
- Warm off-white background, a serif display face with a sans for UI, 16px rounded image corners, pill buttons.
- "Programs" rollover: the hovered row becomes a dark rounded card with an arrow while the other rows fade back
  (about 0.25s, easeOutCubic).
- Sections change background colour as you scroll; the footer is a few large serif links.

## spiegeldesign.co
- Built in Framer. White page, black rounded header bar, Inter throughout; tight, heavy display type.
- Short headline hero with three small stats, then work almost immediately: a 3-column grid of rounded cards
  (image, client, one-line description).
- Section labels as "/ Capabilities" on the left and a count "(04)" on the right.
- Capabilities: a dark rounded panel of four large discipline names, each numbered on the right. A row opens to
  show one sentence plus pill-shaped service tags.
- Process: "My process is intentionally simple." pinned on the left; four numbered step cards stacked in a
  rounded container on the right.

## Taken into the wireframe
| Pattern | From | Where |
|---|---|---|
| Label-left / content-right grid | Nonstop | Every section |
| Sticky collapsing project stack | Nonstop | Home, Selected work |
| Footer wordmark | Nonstop | Footer |
| Rounded 16px media, pill buttons | Collins | Everywhere |
| Rollover row → filled card, siblings fade | Collins | Work index (/work) |
| Work high on the page, short intro | Spiegel | Home |
| Big discipline names that open to a line + tags | Spiegel | Capabilities (home + about) |
| Pinned statement + numbered step cards | Spiegel | Process (home + about) |
| Expand/collapse panels | Nonstop | FAQs (about) |
