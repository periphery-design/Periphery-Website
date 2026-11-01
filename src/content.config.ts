import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    // One block in a project's gallery.
    //  image: an image on its own ("full" width or "half")
    //  split: an image with live text beside it, replacing text that used to be baked into a board
    const block = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('image'),
        image: image(),
        alt: z.string(),
        size: z.enum(['full', 'half']).default('full'),
        caption: z.string().optional(),
        bg: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),  // panel colour behind the image (e.g. a transparent PNG/WebP)
      }),
      z.object({
        type: z.literal('split'),
        image: image(),
        alt: z.string(),
        heading: z.string().optional(),
        text: z.string(),
        imageSide: z.enum(['left', 'right']).default('right'),
      }),
      // grid: several images laid out two-up on desktop, stacked on phones
      z.object({
        type: z.literal('grid'),
        images: z.array(z.object({ image: image(), alt: z.string() })),
      }),
      // text: a text band on its own, placed anywhere in the image sequence (label on the left)
      z.object({
        type: z.literal('text'),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()),
      }),
      // bento: four tiles — large (5:6), tall (5:12), and two stacked small (5:7 over 15:14) — with an
      // optional text band above. Rearranges for tablet and phone.
      z.object({
        type: z.literal('bento'),
        heading: z.string().optional(),
        text: z.string().optional(),
        large: z.object({ image: image(), alt: z.string() }),
        tall: z.object({
          image: image(), alt: z.string(),
          // Optional animated version: each slide as its own layer, positioned in the tall image's
          // pixel space (canvas height). Slides start tucked under the first and expand downward.
          layers: z.array(z.object({ image: image(), top: z.number(), height: z.number() })).optional(),
          canvas: z.number().optional(),
        }),
        smallTop: z.object({ image: image(), alt: z.string() }),
        smallBottom: z.object({ image: image(), alt: z.string() }),
      }),
      // principles: a row of short titled points (3 across on desktop, stacked on phones)
      z.object({
        type: z.literal('principles'),
        items: z.array(z.object({ title: z.string(), text: z.string() })).min(1).max(4),
      }),
      // swatches: brand colours built in code, with their print and screen values
      z.object({
        type: z.literal('swatches'),
        colours: z.array(z.object({
          name: z.string(),
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          pms: z.string().optional(),
          cmyk: z.string().optional(),
          rgb: z.string().optional(),
        })).min(1).max(4),
      }),
      // trio: one main image (8 columns) beside two stacked images (4 columns). The pair sets the height;
      // the main image is centred on a panel of colour `bg`, so flat-background cards line up seamlessly.
      z.object({
        type: z.literal('trio'),
        main: z.object({ image: image(), alt: z.string() }),
        top: z.object({ image: image(), alt: z.string() }),
        bottom: z.object({ image: image(), alt: z.string() }),
        bg: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      }),
    ]);

    return z.object({
      title: z.string(),            // the campaign line
      client: z.string(),
      product: z.string().optional(),
      year: z.union([z.number(), z.string()]),
      sector: z.string(),
      role: z.string(),
      channels: z.array(z.string()),
      summary: z.string(),          // one or two sentences for the homepage card
      order: z.number(),            // position on the homepage
      cover: image().optional(),    // homepage card + project hero
      coverAlt: z.string().optional(),
      theme: z.enum(['dark', 'light']).optional(),  // lock the project page to one theme (toggle hidden there)
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),  // project colour, e.g. the carousel bars
      carousel: z.array(image()).max(3).default([]),             // homepage card slideshow (up to 3; cover is used if empty)
      overviewHeading: z.string().optional(),      // label beside the intro text (default "Overview")
      overview: z.array(z.string()).default([]),   // opening paragraphs under the hero
      insight: z.object({                          // strategy text beside an image
        paragraphs: z.array(z.string()),
        image: image().optional(),
        alt: z.string().optional(),
      }).optional(),
      brief: z.string().optional(),
      idea: z.string().optional(),
      note: z.string().optional(),                 // small closing context note
      gallery: z.array(block).default([]),
      results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    });
  },
});

export const collections = { projects };
