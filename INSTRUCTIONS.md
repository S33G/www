# ASCII Blog - Instructions

A clean, modern blog with dynamic ASCII art backgrounds.

## Quick Start

```bash
cd ascii-blog
bun install
bun run dev
```

Visit http://localhost:4321 (or the port shown in terminal).

## Project Structure

```
src/
├── components/
│   ├── ascii/          # ASCII renderer and background
│   ├── content/        # Post and project cards
│   └── ui/             # Navigation, settings panel
├── content/
│   └── blog/           # Markdown blog posts
├── layouts/            # Page layouts
├── lib/                # Utilities and preferences
├── pages/              # Routes
└── styles/             # Global CSS
```

## Features

### Settings Panel

Click the gear icon (bottom-right) to open settings:

- **Appearance**: Light, Dark, or Auto (system)
- **Accent Color**: 6 preset colors (Emerald, Ocean, Violet, Amber, Rose, Slate)
- **Background Effect**: None, Wave, Rain, Pulse, Glitch
- **Speed**: Adjust animation speed
- **Intensity**: Adjust effect visibility
- **Auto-cycle**: Randomly cycle through effects

Settings are saved to localStorage.

### Color System

- **Primary color**: Used for links, buttons, tags, accents
- **Background tint**: Subtle version of primary for ASCII effects
- UI elements use the primary color
- Background ASCII effects use tinted versions

### Adding Blog Posts

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "My Post Title"
description: "A brief description"
pubDate: 2026-01-19
tags: ["tag1", "tag2"]
draft: false
---

Your content here...
```

### Keyboard Shortcuts

- `Escape`: Close settings panel (when open)

## Customization

### Adding New Color Themes

Edit `src/lib/preferences.ts`:

```typescript
export const COLOR_THEMES = {
  // Add new theme
  coral: {
    name: 'Coral',
    primary: '#ff7f50',
    primaryLight: '#ff9a76',
    bgTint: 'rgba(255, 127, 80, 0.15)',
    bgGlow: 'rgba(255, 127, 80, 0.4)',
  },
  // ...existing themes
};
```

### Modifying Effects

Effects are defined in `src/lib/ascii/ASCIIRenderer.ts`. Each effect is a render method:

- `renderWave()` - Sine wave pattern
- `renderMatrix()` - Falling characters
- `renderPulse()` - Radiating circles
- `renderGlitch()` - Random noise

## Deployment

Build for production:

```bash
bun run build
```

Deploy `dist/` to any static host (Cloudflare Pages, Vercel, Netlify).

## Tech Stack

- **Astro** - Static site generator
- **React** - Interactive components (settings panel)
- **TypeScript** - Type safety
- **Bun** - Package manager and runtime
- **Canvas 2D** - ASCII rendering
