## Handoff Spec: Shared Layout (header, menu bar, search)

Applies to every page. Source: `js/layout.js`, `css/layout.css`, `css/tokens.css`.

### Overview
Every page shows the site title, then a full-width menu bar, then page content. Background is dark green on all pages.

### Layout
- Title: centered, above the menu bar, cursive, large.
- Menu bar: full width, left to right. Links on the left, search on the right.
- Content: `.container`, max width `--content-width`, centered.

### Design Tokens Used
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | #0f2a1d | Page background |
| `--color-surface` | #163a28 | Cards, inputs |
| `--color-text` | #f3efe6 | Body text, menu links |
| `--color-accent` | #e8b4b8 | Hover, active link, focus ring, buttons |
| `--font-heading` | Great Vibes, cursive | Site title, page titles |
| `--font-size-title` | clamp(3rem, 9vw, 6rem) | Site title |
| `--space-sm/md/lg` | 0.5 / 1 / 2 rem | Menu padding and gaps |

### Components
| Component | Props | Notes |
|-----------|-------|-------|
| Site title | `SITE_NAME` | Text "Jasna Flower Studio", `<h1>` |
| Menu link | `label`, `href` | Defined in `MENU_ITEMS`; Home, Gallery, Products, Services, Contact |
| Search form | none | GET to `products.html?q=term`; field is prefilled with current `q` |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Menu link | Hover | Text turns accent color (200ms) |
| Menu link | Current page | Accent color, underline, `aria-current="page"` |
| Menu link / input / button | Focus | 2px accent outline |
| Search | Submit empty | Goes to Products with all items shown |

### Responsive Behavior
| Breakpoint | Changes |
|------------|---------|
| Desktop (>768px) | Links left, search right, one row |
| Mobile (<=768px) | Links and search wrap and center; title scales down via `clamp` |

### Edge Cases
- **Many menu items**: links wrap to a second row.
- **Long search text**: input scrolls horizontally, no layout change.
- **JS disabled**: header does not render (known limitation; replace with server includes when a backend exists).

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Menu link | Hover | Color and underline fade | 200ms | ease |

### Accessibility Notes
- Focus order: menu links, search input, Search button, page content.
- `<nav aria-label="Main">`; search form has `role="search"`; input has `aria-label`.
- Cream on dark green gives high contrast; accent pink on dark green also passes AA for normal text.
