# SSR ASCII Background Plan

Goal: render a non-animated ASCII background on the server so the first paint shows the ASCII aesthetic before client hydration, following Astro’s SSR patterns.

## 1) Shape the SSR output
- Render a static ASCII frame as plain HTML (preferred) or SVG.
- Keep it visually similar to the client canvas output but simplified (no animation).
- Use a deterministic seed per route so the same page yields the same ASCII snapshot.

## 2) Add a server-side renderer
- Create `src/lib/ascii/ASCIIServerRenderer.ts` that:
  - Accepts width/height (or cols/rows), theme colors, and effect type.
  - Reuses shared constants (char sets, effects) where possible.
  - Returns a string grid for `<pre>` or `<svg>` with CSS for positioning.
- Keep it server-only:
  - Import it only in `.astro` frontmatter (not in client components).
  - Avoid browser APIs (no `window`, `document`, canvas).

## 3) Integrate into `ASCIIBackground.astro`
- In the `.astro` frontmatter:
  - Determine effect and theme from `Astro.props` and `Astro.locals` or defaults.
  - Generate the ASCII snapshot server-side using the new renderer.
- Render a static wrapper behind the canvas:
  - `<pre class="ascii-ssr">` or `<svg class="ascii-ssr">`.
  - Keep it `aria-hidden="true"` and `role="presentation"`.
- Keep the existing client component (`ASCIIBackground.tsx`) for animation on hydration.

## 4) Switch to progressive enhancement
- CSS:
  - `.ascii-ssr` sits in the same fixed position as the canvas.
  - When the client canvas initializes, fade out or hide `.ascii-ssr`.
- JS:
  - On successful client init, add a `data-ascii-ready` attribute or class to `body`.
  - CSS toggles: `.ascii-ssr { opacity: 0; }` once the client is ready.

## 5) Follow Astro SSR guidance
- Use frontmatter to compute SSR output (no client imports).
- Keep SSR output in `.astro` components (Astro encourages server rendering there).
- Use `client:*` directives only for the animated React canvas component.

## 6) Performance + caching
- For static builds, the SSR snapshot is precomputed at build time.
- For SSR mode, cache the generated frame per route (in-memory) if needed.
- Provide a low-resolution grid size by default; scale using CSS.

## 7) Safety + accessibility
- Don’t let the SSR ASCII block clicks (`pointer-events: none`).
- Keep it decorative with `aria-hidden="true"`.
- Respect `prefers-reduced-motion` by lowering opacity (same as current CSS).

## 8) Testing + verification
- Manually inspect first paint with JS disabled:
  - Confirm ASCII is visible.
  - Ensure content is readable (z-index and contrast).
- Ensure hydration removes or fades the SSR layer cleanly.

## Optional Enhancements
- Allow per-page seed or effect via frontmatter (e.g., home = matrix).
- Use `Astro.url.pathname` as a stable seed.
- Generate SVG for better scaling and sharper output.
