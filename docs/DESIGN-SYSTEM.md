# DESIGN-SYSTEM.md - UI/UX Specification

> Design tokens, components, animations, and page templates.
> Last updated: 2026-01-31

## Table of Contents

1. [Design Methodology](#design-methodology)
2. [Design Tokens](#design-tokens)
3. [Component Architecture](#component-architecture)
4. [Page Templates](#page-templates)
5. [Animation System](#animation-system)
6. [Responsive Behavior](#responsive-behavior)

---

## Design Methodology

```
┌─────────────────────────────────────────────────────────────────┐
│  DESIGN METHODOLOGY                                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Mobile-First                                                │
│     • Design for 375px first (iPhone SE)                        │
│     • Enhance progressively for tablet (768px) and desktop      │
│     • Touch-friendly targets (min 44x44px)                      │
│     • Content prioritization for small screens                  │
│                                                                 │
│  2. Design Tokens (Single Source of Truth)                      │
│     • All design values defined once                            │
│     • Used everywhere consistently                              │
│     • Easy to update globally                                   │
│                                                                 │
│  3. Component-Based Architecture                                │
│     • Reusable, composable components                           │
│     • Consistent patterns                                       │
│     • Accessible by default                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Tech Choice:** Tailwind CSS + shadcn/ui

- Tailwind: Utility-first, design tokens built-in, mobile-first by default
- shadcn/ui: Beautiful accessible components, you own the code, built on Radix UI

---

## Design Tokens

### Colors (tailwind.config.js)

```javascript
colors: {
  // Brand - Based on Veliki Bukovec crest (greens + gold)
  primary: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main brand green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  accent: {
    500: '#eab308',  // Gold/yellow from crest
    600: '#ca8a04',
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutrals (slate for professional government feel)
  neutral: {
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
}
```

### Typography

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],      // Body text
  display: ['Plus Jakarta Sans', 'sans-serif'],    // Headings
}

fontSize: {
  'xs':   ['0.75rem', { lineHeight: '1rem' }],     // 12px
  'sm':   ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
  'lg':   ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  'xl':   ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
  '2xl':  ['1.5rem', { lineHeight: '2rem' }],      // 24px
  '3xl':  ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl':  ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl':  ['3rem', { lineHeight: '1' }],           // 48px
}
```

### Spacing

```javascript
// 4px base unit
spacing: {
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '2': '0.5rem',      // 8px
  '3': '0.75rem',     // 12px
  '4': '1rem',        // 16px
  '6': '1.5rem',      // 24px
  '8': '2rem',        // 32px
  '12': '3rem',       // 48px
  '16': '4rem',       // 64px
  '24': '6rem',       // 96px
}
```

### Breakpoints (mobile-first)

```javascript
screens: {
  'sm': '640px',   // Large phones
  'md': '768px',   // Tablets
  'lg': '1024px',  // Small laptops
  'xl': '1280px',  // Desktops
  '2xl': '1536px', // Large screens
}
```

### Border Radius & Shadows

```javascript
borderRadius: {
  'sm': '0.25rem',    // 4px
  'DEFAULT': '0.5rem', // 8px
  'lg': '0.75rem',    // 12px
  'xl': '1rem',       // 16px
  'full': '9999px',   // Pill shape
}

boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT HIERARCHY                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRIMITIVES (atoms) - Basic building blocks                     │
│  └── Button, Input, Label, Badge, Avatar, Icon, Spinner         │
│                                                                 │
│  COMPONENTS (molecules) - Combined primitives                   │
│  └── Card, Form Field, Search Bar, Dropdown, Modal, Toast       │
│      Navigation Item, Breadcrumb, Pagination                    │
│                                                                 │
│  FEATURES (organisms) - Business-specific components            │
│  └── PostCard, DocumentCard, EventCard, GalleryGrid             │
│      AIContentGenerator, ChatbotWidget, StatsCard               │
│      PostEditor, DocumentUploader, ImageUploader                │
│                                                                 │
│  LAYOUTS (templates) - Page structure                           │
│  └── PublicLayout, AdminLayout, AuthLayout                      │
│      PageHeader, Sidebar, Footer                                │
│      PageLayoutV2 (sidebar + content), SmallHero                │
│                                                                 │
│  NAVIGATION (2026-01-31) - New sidebar navigation system        │
│  └── SidebarNav, SidebarItem (accordion with scroll spy)        │
│      MobileNavPill, MobileNavSheet (bottom sheet pattern)       │
│                                                                 │
│  PAGES - Full page compositions                                 │
│  └── Homepage, NewsPage, PostDetailPage, AdminDashboard         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Variants Pattern (cva)

```typescript
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
        outline: "border border-neutral-300 bg-white hover:bg-neutral-50",
        ghost: "hover:bg-neutral-100",
        danger: "bg-error text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// Usage
<Button variant="primary" size="lg">Objavi</Button>
```

---

## Page Templates

### Public Site Templates

**Homepage:**
- Header (logo, navigation, search)
- Hero (featured news, quick links)
- Latest News (3-4 cards) + Quick Links sidebar
- Upcoming Events
- Footer
- Chatbot FAB (floating action button)

**List Page (News, Documents):**
- Header
- Page Title + Breadcrumbs
- Filters (category, year, search)
- Item Grid/List
- Pagination
- Footer

**Detail Page (Single Post):**
- Header
- Breadcrumbs
- Title + Meta (date, category)
- Featured Image
- Content + Sidebar (related, share)
- Footer

**Static/Info Page:**
- Header
- Page Title + Hero Image
- Main Content + Sub-navigation
- Footer

**Sidebar Layout Page (PageLayoutV2):** *(Added 2026-01-31)*
- Header with Kontakt button
- Two-column layout:
  - Left: 280px sticky sidebar (accordion navigation with scroll spy)
  - Right: Small hero (200-250px) + prose content
- Mobile: Sticky bottom pill → Bottom sheet navigation
- Pages using this: `/nacelnik`, `/vijece`, `/zupa`, `/skola`, `/opcina`, `/usluge`, `/naselja/*`

**Small Hero:**
- Height: 200-250px (not full viewport)
- Rounded corners, contained within content area
- Optional background image with gradient overlay
- Title + subtitle animated on mount

### Admin Templates

**Admin Layout:**
- Sidebar (collapsible on mobile)
- Header (user menu, notifications)
- Main content area

**Admin List:**
- Page title + Add button
- Search + Filters
- Data table
- Pagination + Bulk actions

**Admin Editor:**
- Back button + Title + Save/Publish buttons
- Main editor + Sidebar (status, category, image, Facebook)

---

## Animation System

### Motion Principles

- **Purposeful:** Every animation has a reason
- **Subtle:** Enhance, don't distract
- **Fast:** Keep it snappy (150-300ms)
- **Consistent:** Same action = same animation
- **Accessible:** Respect prefers-reduced-motion

### Motion Tokens

```javascript
// Duration scale
duration: {
  instant: '50ms',    // Micro-feedback (button press)
  fast: '150ms',      // Hover states, toggles
  normal: '250ms',    // Most transitions
  slow: '350ms',      // Complex animations
  slower: '500ms',    // Page transitions, modals
}

// Easing curves
easing: {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}
```

### Framer Motion Presets

```typescript
// animations/presets.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },

// Navigation animations (added 2026-01-31)
export const sidebarItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export const sidebarContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const bottomSheetTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};
  transition: { duration: 0.2 }
};

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.05 } }
};
```

### Animation Categories

| Category | Examples | Timing |
|----------|----------|--------|
| Micro-interactions | Button press, hover | 50-150ms |
| Component transitions | Dropdown, modal | 200-350ms |
| Page transitions | Route changes | 250-500ms |
| Scroll animations | Fade in on scroll | 300ms |
| Loading states | Skeleton shimmer | Continuous |
| "Wow" moments | Hero, success | 300-500ms |

---

## Responsive Behavior

### Mobile (< 768px)
- Single column layouts
- Hamburger menu for navigation
- Full-width cards
- Stacked form layouts
- Bottom sheet modals
- Touch-optimized buttons (min 44px)

### Tablet (768px - 1024px)
- 2-column grids where appropriate
- Collapsible sidebar
- Side-by-side form layouts

### Desktop (> 1024px)
- Full multi-column layouts
- Persistent sidebar
- Hover states
- Keyboard shortcuts
