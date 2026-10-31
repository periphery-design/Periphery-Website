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
      overview: z.array(z.string()).default([]),   // opening paragraphs under the hero
      insight: z.object({                          // strategy text beside an image
        paragraphs: z.array(z.string()),
        image: image(),
        alt: z.string(),
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
