import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),          // the campaign line, e.g. "Own the Hallway"
    client: z.string(),
    year: z.number(),
    sector: z.string(),
    role: z.string(),
    channels: z.array(z.string()),
    summary: z.string(),        // one or two sentences for the homepage card
    order: z.number(),          // position on the homepage
    brief: z.string(),
    idea: z.string(),
    results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  }),
});

export const collections = { projects };
