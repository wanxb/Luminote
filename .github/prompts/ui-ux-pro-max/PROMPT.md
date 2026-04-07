# ui-ux-pro-max

Comprehensive design guide for web and mobile applications. Contains 67 styles, 96 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 13 technology stacks. Searchable database with priority-based recommendations.

## Workspace Defaults: Luminote

When working in this repository, treat the default product context as a photography portfolio built with Next.js App Router.

Default assumptions for this workspace:
- Product type: photography portfolio, gallery, editorial image showcase
- Primary goals: image-first browsing, fast loading, elegant masonry layout, lightbox viewing, EXIF-rich detail presentation
- Default stack: `nextjs`
- Visual direction: restrained, cinematic, minimal, typography-aware, gallery-first
- Layout preference: masonry or adaptive multi-column flow with mixed aspect ratios
- Interaction preference: subtle hover overlays, keyboard-friendly lightbox, minimal chrome around photos

Anti-defaults for this workspace unless the user explicitly asks otherwise:
- Do not default to SaaS hero + features + pricing structures
- Do not over-index on CTA-heavy landing page patterns
- Do not force all gallery images into identical aspect ratios
- Do not bury photographs under dense text blocks, badges, or noisy gradients
- Do not introduce generic startup-style cards, dashboards, or conversion sections on the public gallery

When a request is ambiguous, bias toward:
- Portfolio grid
- Masonry gallery
- Photographer profile module integrated into the image flow
- Lightbox with metadata and immersive viewing
- Calm color systems with strong contrast and minimal accent use

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## How to Use This Workflow

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: React, Vue, Next.js, or default to `nextjs` for this workspace

### Luminote-Specific Requirement Heuristics

For this workspace, additionally check for these constraints before designing:
- Gallery tiles should preserve the feeling of mixed photo ratios rather than uniform crops
- Photographer profile card can be treated as one tile inside the gallery composition when appropriate
- Public pages should prioritize browsing and artwork presentation over marketing copy
- EXIF, date, device, lens, and location belong in the viewing experience, not as decorative noise on every card
- Mobile and desktop should both feel native to photo browsing, with tap/keyboard navigation considered from the start
- If redesigning the homepage, favor a gallery-led composition over a separate conversion-focused hero

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:
1. Searches 5 domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**
```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

**Luminote workspace example:**
```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "photography portfolio editorial masonry gallery nextjs immersive lightbox" --design-system -p "Luminote"
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for hierarchical retrieval across sessions, add `--persist`:

```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

This creates:
- `design-system/MASTER.md` — Global Source of Truth with all design rules
- `design-system/pages/` — Folder for page-specific overrides

**With page-specific override:**
```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

This also creates:
- `design-system/pages/dashboard.md` — Page-specific deviations from Master

**How hierarchical retrieval works:**
1. When building a specific page (e.g., "Checkout"), first check `design-system/pages/checkout.md`
2. If the page file exists, its rules **override** the Master file
3. If not, use `design-system/MASTER.md` exclusively

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need | Domain | Example |
|------|--------|---------|
| More style options | `style` | `--domain style "glassmorphism dark"` |
| Chart recommendations | `chart` | `--domain chart "real-time dashboard"` |
| UX best practices | `ux` | `--domain ux "animation accessibility"` |
| Alternative fonts | `typography` | `--domain typography "elegant luxury"` |
| Landing structure | `landing` | `--domain landing "hero social-proof"` |

### Step 4: Stack Guidelines (Default: nextjs in this workspace)

Get implementation-specific best practices. If user doesn't specify a stack, **default to `nextjs` in this workspace**.

```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "<keyword>" --stack nextjs
```

Available stacks: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## Search Reference

### Available Domains

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI styles, colors, effects | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | Font pairings, Google Fonts | elegant, playful, professional, modern |
| `color` | Color palettes by product type | saas, ecommerce, healthcare, beauty, fintech, service |
| `landing` | Page structure, CTA strategies | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | Chart types, library recommendations | trend, comparison, timeline, funnel, pie |
| `ux` | Best practices, anti-patterns | animation, accessibility, z-index, loading |
| `react` | React/Next.js performance | waterfall, bundle, suspense, memo, rerender, cache |
| `web` | Web interface guidelines | aria, focus, keyboard, semantic, virtualize |
| `prompt` | AI prompts, CSS keywords | (style name) |

### Available Stacks

| Stack | Focus |
|-------|-------|
| `html-tailwind` | Tailwind utilities, responsive, a11y (DEFAULT) |
| `react` | State, hooks, performance, patterns |
| `nextjs` | SSR, routing, images, API routes |
| `vue` | Composition API, Pinia, Vue Router |
| `svelte` | Runes, stores, SvelteKit |
| `swiftui` | Views, State, Navigation, Animation |
| `react-native` | Components, Navigation, Lists |
| `flutter` | Widgets, State, Layout, Theming |
| `shadcn` | shadcn/ui components, theming, forms, patterns |
| `jetpack-compose` | Composables, Modifiers, State Hoisting, Recomposition |

---

## Example Workflow

**User request:** "重做摄影作品站首页，做成图片优先的瀑布流和沉浸式看图体验"

### Step 1: Analyze Requirements
- Product type: Photography portfolio
- Style keywords: editorial, minimal, cinematic, image-first
- Industry: Creative / Photography
- Stack: nextjs (workspace default)

### Step 2: Generate Design System (REQUIRED)

```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "photography portfolio editorial masonry gallery nextjs immersive lightbox" --design-system -p "Luminote"
```

**Output:** Complete design system with pattern, style, colors, typography, effects, and anti-patterns.

### Step 3: Supplement with Detailed Searches (as needed)

```bash
# Get UX guidelines for animation and accessibility
python .github/prompts/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# Get typography options for editorial photography presentation
python .github/prompts/ui-ux-pro-max/scripts/search.py "editorial serif grotesk photography" --domain typography

# Get gallery structure recommendations
python .github/prompts/ui-ux-pro-max/scripts/search.py "masonry gallery hover overlay lightbox" --domain landing
```

### Step 4: Stack Guidelines

```bash
python .github/prompts/ui-ux-pro-max/scripts/search.py "gallery layout image loading lightbox" --stack nextjs
```

**Then:** Synthesize design system + detailed searches and implement the design.

### Luminote Output Priorities

When turning the design system into code in this workspace, prioritize the following in order:
1. Strong photo presentation and browsing rhythm
2. Correct image behavior, including responsive loading and non-uniform tile ratios
3. Cohesive lightbox and metadata experience
4. Typography and spacing that support the work without competing with it
5. Motion restraint and accessibility
6. Only then add supporting copy, profile blocks, or secondary navigation

---

## Output Formats

The `--design-system` flag supports two output formats:

```bash
# ASCII box (default) - best for terminal display
python .github/prompts/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - best for documentation
python .github/prompts/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## Tips for Better Results

1. **Be specific with keywords** - "healthcare SaaS dashboard" > "app"
2. **Search multiple times** - Different keywords reveal different insights
3. **Combine domains** - Style + Typography + Color = Complete design system
4. **Always check UX** - Search "animation", "z-index", "accessibility" for common issues
5. **Use stack flag** - Get implementation-specific best practices
6. **Iterate** - If first search doesn't match, try different keywords
7. **For Luminote, include gallery intent** - Queries should mention terms like `photography`, `portfolio`, `masonry`, `gallery`, `lightbox`, `editorial`, `nextjs`

---

## Luminote Public-Site Rules

Use these extra rules when the task touches the public gallery or homepage in this repository:

| Rule | Do | Don't |
|------|----|----- |
| **Gallery first** | Let photos define the page rhythm | Start from text blocks and fit photos around them |
| **Mixed aspect ratios** | Preserve varied image proportions in grid layouts | Normalize everything into 1:1 or 4:5 without reason |
| **Quiet overlays** | Reveal minimal metadata on hover or focus | Keep permanent heavy captions on every tile |
| **Profile integration** | Treat photographer info as part of the composition | Isolate profile info in a bulky sidebar by default |
| **Lightbox depth** | Use EXIF and metadata to enrich the full-view state | Dump all metadata into the grid view |
| **Editorial typography** | Use display/body combinations with character | Fall back to generic app typography and dashboard spacing |

---

## Common Rules for Professional UI

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule | Do | Don't |
|------|----|----- |
| **No emoji icons** | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons |
| **Stable hover states** | Use color/opacity transitions on hover | Use scale transforms that shift layout |
| **Correct brand logos** | Research official SVG from Simple Icons | Guess or use incorrect logo paths |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6 | Mix different icon sizes randomly |

### Interaction & Cursor

| Rule | Do | Don't |
|------|----|----- |
| **Cursor pointer** | Add `cursor-pointer` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback** | Provide visual feedback (color, shadow, border) | No indication element is interactive |
| **Smooth transitions** | Use `transition-colors duration-200` | Instant state changes or too slow (>500ms) |

### Light/Dark Mode Contrast

| Rule | Do | Don't |
|------|----|----- |
| **Glass card light mode** | Use `bg-white/80` or higher opacity | Use `bg-white/10` (too transparent) |
| **Text contrast light** | Use `#0F172A` (slate-900) for text | Use `#94A3B8` (slate-400) for body text |
| **Muted text light** | Use `#475569` (slate-600) minimum | Use gray-400 or lighter |
| **Border visibility** | Use `border-gray-200` in light mode | Use `border-white/10` (invisible) |

### Layout & Spacing

| Rule | Do | Don't |
|------|----|----- |
| **Floating navbar** | Add `top-4 left-4 right-4` spacing | Stick navbar to `top-0 left-0 right-0` |
| **Content padding** | Account for fixed navbar height | Let content hide behind fixed elements |
| **Consistent max-width** | Use same `max-w-6xl` or `max-w-7xl` | Mix different container widths |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality
- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] Brand logos are correct (verified from Simple Icons)
- [ ] Hover states don't cause layout shift
- [ ] Use theme colors directly (bg-primary) not var() wrapper

### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Light/Dark Mode
- [ ] Light mode text has sufficient contrast (4.5:1 minimum)
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
- [ ] Test both modes before delivery

### Layout
- [ ] Floating elements have proper spacing from edges
- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] `prefers-reduced-motion` respected
