# Image specs for case study pages

Measured from the live layout (no max page width; 32px side margins). Export at the sizes below and
Astro produces smaller WebP versions automatically, so one high-res export per image is enough.

| Slot | Shape | Export size | Shown at 1440 / 1920 / 2560 screen |
|---|---|---|---|
| Cover / project hero (also the homepage card) | 16:9 | **3200 × 1800** | 1376 / 1856 / 2496 px wide |
| Full-width gallery image | 16:9 (other wide ratios OK) | **3200 × 1800** | 1376 / 1856 / 2496 |
| Image beside text (split) and insight image | **4:3**, cropped to fill | **1600 × 1200** | 555×416 / 755×566 / 1021×766 |
| Two-up grid image | 16:9, cropped to fill | **2000 × 1125** | 672 / 912 / 1232 |
| Homepage card carousel (up to 3) | shown at 16:11, centre-cropped | use the 16:9 cover-size exports | 672×462 at 1440 |

Why these numbers: high-density (retina) laptop screens need about 2× the shown width. 3200 covers a
1440 retina screen (needs ~2750) and a 1920 desktop at full sharpness.

## Composition
- 4:3 split images sit beside ~60%-wide text panels; keep the subject in the central 80%.
- Carousel images get cropped from 16:9 to 16:11 (a little off each side) and have thin progress bars
  over the bottom ~30px: keep logos and key type away from the bottom edge.
- No description text baked into images: send it as words and it is set as live text.
  Headlines that are part of the artwork (a billboard, a phone screen) are fine.

## Files
- JPG, high quality (85–95), sRGB. PNG for flat graphics with sharp edges. Max ~15 MB each.
- Name them by what they show, e.g. `billboard.jpg`, `stage-screen.jpg`.
