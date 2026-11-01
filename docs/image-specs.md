# Image specs for case study pages

Page rhythm: text band → full-width image → text band → full-width image. Text never sits beside an image.
Measured from the live layout (32px side margins, no max page width). Export once at the size below; Astro
makes the smaller WebP versions automatically.

| Slot | Shape | Export size | Shown at 1440 / 1920 / 2560 screen |
|---|---|---|---|
| Cover / project hero (also the homepage card + carousel) | 16:9 | **3200 × 1800** | 1376 / 1856 / 2496 px wide |
| Every full-width story image | 16:9 | **3200 × 1800** | 1376 / 1856 / 2496 |
| Extra-wide (billboards, stages) — optional | 21:9 | **3200 × 1372** | same widths, shorter |
| Two-up photo grid (each image) | 16:9 | **2000 × 1125** | 672 / 912 / 1232 |

- 16:9 fills the frame edge to edge. Anything taller than about 16:9 is capped at the screen height and
  centred on a dark panel, so it works, but loses impact: keep story images landscape.
- Why 3200: retina laptop screens need about 2× the shown width (a 1440 retina screen needs ~2750).
- Pixels are what count; ppi/dpi in the file doesn't matter. JPG, quality 85–95, sRGB. PNG only for flat
  graphics. Max ~15 MB each.

## Composition
- Homepage carousel crops the 16:9 cover to 16:11 (a little off each side) and puts thin progress bars over the
  bottom ~30px: keep logos and key type away from the bottom edge and the far left/right.
- No description text baked into images. Send it as words; it becomes a live text band.
  Headlines that are part of the artwork (a billboard, a phone screen) are fine.

## Text that goes with each image
For each story image, send: an optional heading (e.g. "The lifestyle layer") and one paragraph. It is set
above the image, heading on the left, paragraph across ~60% of the width.
