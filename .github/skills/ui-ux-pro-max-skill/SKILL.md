---
name: ui-ux-pro-max-skill
description: 'UI/UX design workflow for web and mobile interfaces. Use when the task is to design, redesign, build, implement, review, improve, or fix UI, UX, layout, visual system, typography, color palette, gallery experience, homepage, landing page, dashboard, or interaction design. Especially relevant in this repository for photography portfolio, masonry gallery, editorial presentation, immersive lightbox, and Next.js App Router UI work.'
argument-hint: 'Describe the product/page, stack, and style goals, for example: photography portfolio homepage with masonry gallery and immersive lightbox'
user-invocable: true
disable-model-invocation: false
---

# UI UX Pro Max Skill

## When to Use

- Design or redesign a page, flow, or visual system.
- Implement UI for a homepage, gallery, landing page, dashboard, settings page, or admin surface.
- Review an interface for UX issues, accessibility problems, weak hierarchy, or generic visual direction.
- Generate a design system before coding.
- Improve this repository's public photography experience, especially masonry gallery, profile integration, and immersive lightbox behavior.

## Workspace Defaults For Luminote

Treat the default product context as a photography portfolio built with Next.js App Router.

Default assumptions:
- Product type: photography portfolio, gallery, editorial image showcase
- Primary goals: image-first browsing, fast loading, elegant masonry layout, lightbox viewing, EXIF-rich detail presentation
- Default stack: nextjs
- Visual direction: restrained, cinematic, minimal, typography-aware, gallery-first
- Layout preference: masonry or adaptive multi-column flow with mixed aspect ratios
- Interaction preference: subtle hover overlays, keyboard-friendly lightbox, minimal chrome around photos

Avoid these defaults unless the user explicitly asks for them:
- SaaS hero plus features plus pricing structure
- CTA-heavy landing-page patterns on public gallery pages
- Forced uniform image ratios for every tile
- Dense copy or badge-heavy overlays competing with photographs

## Procedure

### 1. Analyze The Request

Extract:
- Product type
- Style keywords
- Industry or content domain
- Target page or flow
- Stack, defaulting to nextjs in this repository

For Luminote, also check these constraints:
- Preserve mixed image ratios where possible
- Favor gallery-led composition over marketing-led composition
- Keep EXIF and metadata in the immersive viewing layer instead of every grid tile
- Make mobile tap behavior and desktop keyboard behavior part of the first-pass design

### 2. Generate A Design System First

Start with the design-system search before coding:

```bash
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "<query>" --design-system -p "<Project Name>"
```

Luminote example:

```bash
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "photography portfolio editorial masonry gallery nextjs immersive lightbox" --design-system -p "Luminote"
```

This returns recommendations for:
- pattern
- style
- colors
- typography
- effects
- anti-patterns to avoid

### 3. Persist The Design System When Needed

Use persistence when the work will span multiple pages or sessions:

```bash
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "<query>" --design-system --persist -p "<Project Name>"
```

Optional page override:

```bash
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "<query>" --design-system --persist -p "<Project Name>" --page "homepage"
```

### 4. Run Focused Follow-Up Searches

After the design system, pull domain-specific details as needed:

```bash
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "animation accessibility" --domain ux
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "editorial serif grotesk photography" --domain typography
python ./.github/skills/ui-ux-pro-max-skill/scripts/search.py "gallery layout image loading lightbox" --stack nextjs
```

Available domains include product, style, typography, color, landing, chart, ux, react, web, and prompt.

Available stacks include html-tailwind, react, nextjs, vue, svelte, swiftui, react-native, flutter, shadcn, and jetpack-compose.

### 5. Turn Recommendations Into Code

When implementing UI in this repository, prioritize in this order:
1. Strong photo presentation and browsing rhythm
2. Correct image behavior and responsive loading
3. Cohesive lightbox and metadata experience
4. Typography and spacing that support the photography
5. Motion restraint and accessibility
6. Only then supporting copy, profile modules, or secondary navigation

## Public-Site Rules For This Repository

- Let photos define the page rhythm.
- Preserve varied image proportions in gallery layouts.
- Use minimal metadata overlays on tiles.
- Integrate photographer profile information into the composition when appropriate.
- Put richer EXIF and metadata in the full-view state, not the grid.
- Prefer editorial typography over generic app typography.

## Delivery Checklist

- Use SVG icons instead of emoji icons.
- Avoid hover effects that shift layout.
- Keep text contrast strong in light mode.
- Ensure visible focus states for keyboard navigation.
- Verify responsive behavior at common mobile and desktop widths.
- Respect prefers-reduced-motion.
- Keep public gallery pages image-first.

## Resources

- Search script: [scripts/search.py](./scripts/search.py)
- Design system logic: [scripts/design_system.py](./scripts/design_system.py)
- Core search utilities: [scripts/core.py](./scripts/core.py)
