# Expert Web Development Instructions

## Project Overview

This is an Astro 5 project with React 19, Three.js, and Sass. Follow modern best practices for performance, accessibility, and maintainability.

## Core Principles

- Write clean, maintainable, and type-safe code
- Prioritize performance and Core Web Vitals
- Support all modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA minimum)

## TypeScript Standards

- Use TypeScript for all code with strict mode enabled [web:18][web:21]
- Enable all strict compiler flags in tsconfig.json
- Provide explicit type annotations for function parameters and return types
- Use interfaces for data structures and type definitions
- Avoid using `any` - use `unknown` if type is truly unknown
- Prefer `const` over `let`, never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators

## Astro 5 Best Practices

- Leverage Astro's Content Layer API for content management [web:2]
- Use `.astro` components for static content
- Use React components (`.tsx`) only for interactive elements requiring client-side JavaScript
- Minimize client-side JavaScript - default to server-side rendering
- Use `client:load` directive sparingly, prefer `client:visible` or `client:idle` for hydration [web:9]
- Implement proper caching strategies using Astro's built-in features
- Use `astro:env` module for type-safe environment variables [web:2]

## React 19 Best Practices

- Use functional components with hooks exclusively [web:13][web:16]
- Leverage React 19's automatic memoization via React Compiler [web:13]
- Remove redundant `React.memo`, `useMemo`, and `useCallback` unless profiling shows necessity
- Keep components small, focused, and single-responsibility
- Use `startTransition` for non-urgent state updates [web:13]
- Keep state local whenever possible - lift state only when necessary
- Use custom hooks for reusable logic
- Implement proper error boundaries for graceful error handling
- Use `React.lazy` and `Suspense` for code-splitting large components [web:13]

## Three.js Best Practices

- Limit polygon count - favor low-poly meshes for performance [web:17][web:20]
- Use `InstancedMesh` for rendering multiple similar objects efficiently [web:17]
- Implement Level of Detail (LOD) for distant objects [web:17][web:20]
- Dispose geometries, materials, and textures manually using `.dispose()` to prevent memory leaks [web:17][web:20]
- Use texture atlases to reduce draw calls [web:17]
- Target 30-60 FPS, use `requestAnimationFrame` properly
- Profile performance using browser devtools
- Keep draw calls under 100 per frame [web:20]

## Sass/CSS Standards

- Use Sass for all styling with `.scss` extension [web:8]
- Organize styles using 7-1 pattern for large projects [web:8]
- Use CSS Variables (custom properties) for theming and runtime changes [web:8][web:11]
- Define Sass variables for build-time constants, convert to CSS variables where needed
- Follow BEM or similar naming convention for class names
- Use meaningful, descriptive class names
- Keep nesting depth to maximum 3 levels
- Write mobile-first media queries
- Use modern CSS features (Grid, Flexbox, custom properties)
- Avoid `!important` - use more specific selectors instead [web:11]
- Never use inline styles in HTML
- Group related styles by component or functionality

### CSS Variable Pattern

```scss
:root {
  --primary-color: #{$primary-color};
  --spacing-unit: #{$spacing-unit}px;
  --font-family: #{$font-family};
}

// Use CSS variables for runtime changes, Sass variables for static processing
.button {
  background-color: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
  font-family: var(--font-family);
}
```

## Accessibility Standards
- Follow WCAG 2.1 AA guidelines at minimum [web:6][web:12]
- Use semantic HTML5 elements
- Ensure keyboard navigability for all interactive elements
- Provide visible focus indicators
- Use ARIA roles and attributes appropriately
- Ensure sufficient color contrast (minimum 4.5:1 for normal text) [web:12]
- Provide alt text for all images
- Use `lang` attribute on `<html>` for correct language declaration
- Test with screen readers (NVDA, VoiceOver) regularly

## Performance Optimization
- Optimize images using modern formats (WebP, AVIF) and responsive sizes [web:4][web:10]
- Implement lazy loading for images and iframes using `loading="lazy"` [web:10]
- Minimize and bundle CSS and JavaScript using Astro's built-in optimizations [web:3]
- Use HTTP/2 or HTTP/3 for faster asset delivery
- Leverage browser caching with appropriate cache headers
- Use a Content Delivery Network (CDN) for static assets [web:5]
- Defer non-critical JavaScript using `defer` or `async` attributes
- Minimize main thread work to improve Time to Interactive (TTI) [web:14]
- Monitor performance using Lighthouse and Web Vitals regularly

## Testing and Quality Assurance
- Write unit tests for critical logic using Jest or similar [web:15]
- Use React Testing Library for component testing [web:15]
- Perform end-to-end testing with Cypress or Playwright [web:15]
- Set up continuous integration (CI) to run tests on each commit
- Conduct regular code reviews focusing on standards adherence
- Use linters (ESLint, Stylelint) and formatters (Prettier)
- Maintain up-to-date dependencies and monitor for security vulnerabilities [web:7]

## References
- [web:1] Astro Documentation - https://docs.astro.build
- [web:2] Astro Content Layer - https://docs.astro.build/en/guides/content-layer/
- [web:3] Astro Performance Optimization - https://docs.astro.build/en/guid
- [web:4] Image Optimization - https://web.dev/fast/#optimize-images
- [web:5] Using a CDN - https://web.dev/cdn-usage/
- [web:6] WCAG Guidelines - https://www.w3.org/WAI/
- [web:7] Dependency Management - https://snyk.io/blog/keeping-dependencies-up-to-date/
- [web:8] Sass Best Practices - https://sass-guidelin.es/
- [web:9] Astro Client Directives - https://docs.astro.build/en/core
- [web:10] Lazy Loading - https://web.dev/lazy-loading/
- [web:11] CSS Variables - https://css-tricks.com/a-complete-guide
- [web:12] Color Contrast - https://webaim.org/articles/contrast/
- [web:13] React 19 New Features - https://reactjs.org/blog/
- [web:14] Main Thread Work - https://web.dev/main-thread-work/
- [web:15] Testing in JavaScript - https://testing-library.com/docs/
- [web:16] React Hooks Best Practices - https://reactjs.org/docs/hooks-best
- [web:17] Three.js Performance Tips - https://threejs.org/docs/
- [web:18] TypeScript Handbook - https://www.typescriptlang.org/docs/
- [web:19] TypeScript Strict Mode - https://www.typescriptlang.org/
- [web:20] Three.js Optimization - https://discoverthreejs.com/
- [web:21] Type Safety in JavaScript - https://basarat.gitbook.io
# TypeScript Best Practices - https://www.typescriptlang.org/docs/handbook/2/types-from-types
```
---
description: This file describes the overall coding standards and best practices for the project.
applyTo: **/*.ts, **/*.tsx, **/*.astro, **/*.scss
---

## General Coding Standards
- Write clean, maintainable, and well-documented code.
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for types/components).
- Use ES6+ features and syntax.
- Avoid using `any` type; prefer `unknown` or specific types.
- Use `const` for variables that do not change and `let` for those that do
- Keep functions small and focused on a single task.
## TypeScript Specific Guidelines
- Enable `strict` mode in `tsconfig.json`.
- Provide explicit type annotations for function parameters and return types.
- Use interfaces for defining object shapes and types.
- Leverage union and intersection types for complex type definitions.
- Utilize generics for reusable components and functions.
- Handle null and undefined values explicitly using optional chaining and nullish coalescing.
