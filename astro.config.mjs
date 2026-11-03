// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_BASE lets the same code build for staging (e.g. "/new/") or the root ("/").
const base = process.env.SITE_BASE || '/';
const staging = process.env.STAGING === '1';

export default defineConfig({
  site: 'https://www.jntsuppliers.com',
  base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Keep all CSS in files so the Content-Security-Policy can forbid inline styles.
    inlineStylesheets: 'never',
  },
  // No sitemap on the staging copy.
  integrations: staging ? [] : [sitemap({ filter: (page) => !page.includes('/contact/thanks/') })],
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
