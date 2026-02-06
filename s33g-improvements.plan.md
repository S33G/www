## Navigation & Controls
- [ ] Add a top-right floating back button on all pages.
  - Style: square outline button with “ESC” label centered inside.
  - Default destination: `/`.
  - When viewing a blog post, destination should be `/blog`.
  - Should not interfere with header/nav layout.
- [ ] Center nav items on mobile.
  - Breakpoint: 640px and below.
  - Visual alignment should be centered and balanced relative to logo.
- [ ] Support arrow key navigation between blog posts.
  - Left arrow: previous post (older/newer per chronological order used in listing).
  - Right arrow: next post.
  - Only active on single-post pages.
  - Ignore key presses when typing in inputs/textareas/contenteditable elements.

## Blog Engagement
- [ ] Show similar articles at bottom of each blog post.
  - Use tag overlap to determine similarity.
  - Exclude the current post.
  - If no similar posts, omit the section.
  - Display up to 3 posts with title, description, date, and tags.

## ASCII UI Tweaks
- [ ] Move FPS counter to bottom-left corner.
  - Respect safe-area insets.
  - Avoid overlap with footer/back button.
