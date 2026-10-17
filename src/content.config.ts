import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* Articles are bilingual: one directory per article holding `zh.md` and
   `en.md`, the same shape the projects collection already uses. Entry ids are
   therefore `trie/zh` / `trie/en`, and the URL slug is the directory name.

   The second glob pattern excludes template directories. Astro's glob loader
   does NOT skip underscore-prefixed paths on its own, so without that negation
   `src/content/articles/_template/` would be loaded as a real article and
   published at /articles/_template/ — verified against a build, not assumed. */
const articles = defineCollection({
  loader: glob({ pattern: ['*/*.md', '!_*/**'], base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    /** Free-form labels. An article can carry any number of them. */
    tags: z.array(z.string()).default([]),
    /**
     * The article's single subject area (算法 / 日记 / 碎碎念 …). One per
     * article, because a category is a section of the site rather than a
     * label — multi-membership is what `tags` is for. Optional so existing
     * articles keep building; `uncategorised` is the fallback in the UI.
     */
    category: z.string().optional(),
    summary: z.string().optional(),
    /** Optional cover image path (e.g. '/images/covers/trie.png'). When set,
        the article's cards show a square thumbnail on the right. */
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Entry ids look like `paste/zh` and `paste/en`. The second pattern drops `_template/`.
const projects = defineCollection({
  loader: glob({ pattern: ['*/*.md', '!_*/**'], base: './src/content/projects' }),
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

export const collections = { articles, projects };
