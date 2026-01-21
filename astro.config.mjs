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
    // mermaid must be first to process diagrams before MDX
    mermaid({
      theme: 'dark',
      autoTheme: true,
      mermaidConfig: {
        themeVariables: {
          primaryColor: '#1a1a1a',
          primaryBorderColor: '#10b981',
          primaryTextColor: '#f5f5f5',
          lineColor: '#10b981',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          tertiaryColor: '#252525',
          secondaryColor: '#252525',
        },
        flowchart: {
          curve: 'basis',
        },
      },
    }),
    react(),
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: { theme: 'github-dark' },
    }),
    sitemap(),
  ],
  prefetch: { prefetchAll: true },
});
