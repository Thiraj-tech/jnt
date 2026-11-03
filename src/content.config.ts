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
      seoTitle: z.string().optional(),
      h1: z.string().optional(), // on-page heading, when it should differ from the title
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

// Practical guides for printers. Every claim must match the product data or be standard pressroom practice.
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(), // meta description, 155 characters or fewer
    summary: z.string(), // one line for lists
    order: z.number(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    products: z.array(z.string()).default([]), // related product slugs
  }),
});

export const collections = { products, guides };
