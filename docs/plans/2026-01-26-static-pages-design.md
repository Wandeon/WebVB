# Static Pages Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render CMS-managed static pages with section navigation sidebar

**Architecture:** Catch-all route fetches pages by slug path, renders with sidebar showing sibling pages in section

**Tech Stack:** Next.js App Router, Prisma, Tailwind Typography

---

## Routing Strategy

- Single catch-all route at `apps/web/app/[...slug]/page.tsx`
- Handles any path like `/organizacija/uprava`, `/opcina/povijest`
- Falls back to 404 if no matching page in database

## Slug Convention

- Pages store full path as slug: `organizacija`, `organizacija/uprava`, `opcina/o-nama`
- Parent pages have shorter slugs, children have parent slug as prefix
- This allows `findBySlug` to work directly with the URL path

## Repository Additions

- `findPublished()` - returns all pages for `generateStaticParams`
- `findSiblingsBySlug(slug)` - returns sibling pages for sidebar navigation

## Components

### PageLayout
- Hero section with page title
- Optional sidebar for section navigation (desktop: sticky left, mobile: accordion)
- Prose-styled content area for rich HTML
- "Last updated" footer with formatted date

### PageSidebar
- Shows sibling pages in current section
- Highlights active page
- Desktop: sticky sidebar, Mobile: collapsible accordion
- Reuses patterns from DocumentSidebar

### PageContent
- Renders sanitized HTML with Tailwind Typography (`prose`)
- Handles YouTube embeds via iframe detection
- Handles Google Maps embeds via iframe detection

## File Structure

```
apps/web/app/[...slug]/
  page.tsx          # Server component, fetches page by slug
  not-found.tsx     # Custom 404 for missing pages

packages/ui/src/components/
  page-layout.tsx   # Main layout with sidebar + content
  page-sidebar.tsx  # Section navigation sidebar
  page-content.tsx  # Rich HTML renderer with embed support
  page-layout.test.tsx
  page-sidebar.test.tsx
```

## Data Flow

```
URL: /organizacija/uprava
  → catch-all extracts slug: "organizacija/uprava"
  → pagesRepository.findBySlug("organizacija/uprava")
  → Returns page with parent & children relations
  → Fetch siblings via findSiblingsBySlug
  → Render page with section sidebar
```

## ISR

60-second revalidation (consistent with other public pages)

## Gate

Navigate to `/organizacija/uprava`, see content with sidebar showing other Organizacija pages, sidebar highlights current page.
