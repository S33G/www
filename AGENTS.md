# Blogger Agent Style Guide

Use this to write new posts that feel like the existing blog in `src/content/blog`. The tone is informative, calm, and practical. No sales, no hype.

## Voice and tone
- Matter-of-fact, confident, and low drama.
- Informative but not lecture-y. Avoid buzzwords.
- Mildly conversational, but not chatty. No hype or marketing energy.
- Acknowledge tradeoffs and limits. If something is sharp or risky, say so plainly.
- When describing your own work, be direct and specific about the why.

## Structure patterns
- Start with a short, grounded opener: the problem, the motivation, or the context.
- Use clear section headings. Most sections answer a single question.
- Prefer short paragraphs and tight lists.
- Include a "Why" or "What it does" section when shipping a tool.
- Include a "How it works" or "Implementation" section for technical depth.
- End with a concise wrap-up: what worked, what did not, or what is next.

## Language and rhythm
- Keep sentences compact. Mix short and medium length.
- Use concrete nouns and precise verbs. Avoid generic filler.
- Use italics and bold sparingly for emphasis, not for style.
- Use lists for clarity, not padding.
- Ask the occasional rhetorical question, but do not overuse.

## Technical content style
- Show small, focused code snippets that illustrate a point.
- Explain the code in plain terms right after the snippet.
- Use exact numbers or constraints when relevant (limits, ranges, timings).
- Avoid vague claims like "fast" without context. Use comparisons or reasons.
- Prefer "I did X because Y" instead of "X is best".

## Link behavior (do not hardcode)
- Do not hardcode URLs in new posts.
- If a link is needed, reference it generically ("repo link", "live demo link").
- In analysis or summaries, describe link usage instead of listing URLs.

## Formatting conventions
- Use Markdown headings (##, ###) with concise titles.
- Use fenced code blocks with language tags.
- Use inline code for file names, commands, and symbols.
- Use tables sparingly and only when it improves scanability.

## Common content moves to mirror
- State a real constraint or friction early (time, performance, UX, tooling).
- Describe tradeoffs and guardrails when something is powerful or destructive.
- When AI is involved, be honest about where it helped and where it failed.
- Keep the scope tight. If you cut features, say so and why.

## Things to avoid
- Sales language ("launch", "game changer", "revolutionary").
- Over-enthusiastic phrases ("super excited", "amazing").
- Generic motivational closers.
- Long unbroken walls of text.

## Example openings (style only, no links)
- "I built X because Y was slowing me down. I wanted a single-screen tool that did Z and stayed out of the way."
- "This started as the fastest way to get pixels on screen. It worked until real devices entered the picture."
- "I wanted a personal blog that felt distinct, and that meant doing the rendering the hard way."

## Post outline template
1. Opener: problem or motivation in 2-4 sentences.
2. What it does / why it exists.
3. How it works (with 1-3 focused code snippets).
4. Tradeoffs, gotchas, or constraints.
5. What I learned / what is next.
