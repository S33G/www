// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  site: 'https://s33g.dev',
  output: 'static',
  integrations: [
    react(),
    mermaid({
      themeVariables: {
        primaryColor: '#1a1a1a',
        primaryBorderColor: '#10b981',
        primaryTextColor: '#f5f5f5',
        primaryBorderWidth: '2px',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        tertiaryColor: '#252525',
        tertiaryBorderColor: '#10b981',
        tertiaryTextColor: '#10b981',
        edgeLabelBackground: {
          color: 'transparent',
        },
      },
      logLevel: 'error',
    }),
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: { theme: 'github-dark' },
    }),
    sitemap(),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
          },
        },
      },
    },
  },
  prefetch: { prefetchAll: true },
});
