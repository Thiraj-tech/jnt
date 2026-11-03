import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string(),
      order: z.number(),
      codeFamily: z.string().optional(), // only real codes used by the client, e.g. "JNTF"
      summary: z.string(), // one line for lists
      seoDescription: z.string(),
      image: image(),
      imageAlt: z.string(),
      packs: z.string(),
      documents: z.string().default('Safety data sheet on request'),
      bestFor: z.array(z.string()),
      variants: z
        .array(
          z.object({
            code: z.string(),
            name: z.string(),
            bestFor: z.string(),
            text: z.string(),
            points: z.array(z.string()).default([]),
          }),
        )
        .default([]),
      specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      directions: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      safety: z.string().optional(),
    }),
});

export const collections = { products };
