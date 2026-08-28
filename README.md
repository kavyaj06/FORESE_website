# Forese Club Website

Vite + React 19 + TypeScript + Tailwind v4 + React Router 7.

```bash
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run typecheck  # types only
npm run format     # prettier
```

Visit `/styleguide` in dev to see every design token and component on one page.
It is excluded from production builds.

---

## Where things live

The architecture has **three tiers of component**, and **content kept out of markup**.
Every file has one obvious home.

```
design/
  outline/     Canva outline — the source of truth for STRUCTURE
  refs/        Figma/Framer screenshots — the source of truth for LOOK
  assets/      logo, photographs, brand files

src/
  app/routes.tsx        ← THE ROUTE TABLE. Router, navbar, mobile drawer,
                          footer links and page <title>/meta all derive from
                          it. Adding a page means editing this one file.

  styles/
    index.css           entry point — imports the four below
    theme.css           ← ALL design tokens, plus the [data-theme="inverse"]
                          block. The only file allowed to contain a raw
                          colour, font, or magic number.
    base.css            element defaults, focus rings, scrollbar
    patterns.css        dot/line fields and mask fades — the texture that
                          carries depth in a palette with no colour in it
    animations.css      keyframes + the global reduced-motion guard

  components/
    layout/             site chrome — one instance per page
                        RootLayout, Navbar, MobileNav, Footer, Container
    ui/                 TIER 1 — primitives. Know nothing about Forese pages.
                        Button, Card, Badge, Modal, Skeleton, SocialIcon
    sections/           TIER 2 — compositions shared across pages
                        PageHero, SectionHeading
    motion/             Reveal, PageTransition, variants
    dev/                scaffolding, deleted as pages get built

  pages/<page>/
    <Page>.tsx          composes sections; stays a readable table of contents
    sections/           sections used ONLY by this page
    components/         cards etc. used ONLY by this page
    data.ts             ← all copy, stats and lists for this page

  data/site.ts          club name, description, contact, location, socials
  hooks/                useMediaQuery, useScrollLock, usePrefersReducedMotion
  lib/                  cn (class merging), seo (document meta)
```

## The five rules that keep it navigable

1. A component moves `pages/x/components/` → `components/sections/` →
   `components/ui/` only when a **second** page actually needs it.
   No speculative promotion.
2. `ui/` never imports from `pages/`. Dependencies point one direction.
3. **Content never lives in JSX.** Every stat, name, date and paragraph goes in a
   `data.ts`; sections take props. This is what lets other club members update
   the site without touching layout code.
4. Only `styles/theme.css` contains raw colour values — including anything
   lifted from a template reference. The one exception is the `mask-image`
   stops in `styles/patterns.css`: a mask reads only the alpha channel, so
   `#000` there is "opaque", not a colour choice.
5. A page component past ~120 lines has a section that wants extracting.

## Design sources

Two, and they do different jobs:

- **`design/outline/`** (Canva) — page list, section ordering, content hierarchy.
- **`design/refs/`** (Figma/Framer) — visual language.

References contribute **layout, composition and interaction**. Every visual value
is normalised onto the token set in `theme.css`, derived from one chosen anchor
template. Copying a reference's colours and type wholesale is what turns a site
into a patchwork of other people's design systems.

## Status

The design language is decided: **black and white**, refined-minimal character,
Plus Jakarta Sans over Inter. Adding a brand colour later means editing the four
`--color-accent-*` values in `theme.css` and nothing else.

Depth comes from layering rather than colour — a section on `surface` with cards
on `surface-raised`, the `[data-theme="inverse"]` band, and the dot/line fields
in `patterns.css`. Shadows confirm elevation; they are not what creates it.

Page content is placeholder throughout — see the `TODO` markers in
`src/data/site.ts` and the `PhasePlaceholder` blocks on each route.
