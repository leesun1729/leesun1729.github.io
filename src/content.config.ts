import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Entry ids look like `paste/zh` and `paste/en`.
const projects = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    date: z.date(),
    stack: z.array(z.string()).default([]),
    status: z.string().optional(),
    links: z
      .object({
        repo: z.string().optional(),
        release: z.string().optional(),
        demo: z.string().optional(),
      })
      .default({}),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { notes, projects };
