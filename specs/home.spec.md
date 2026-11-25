## Handoff Spec: Home (`index.html`)

### Overview
Landing page. Welcomes visitors and routes them to the shop or the portfolio.

### Layout
Shared layout, then a single `.container` with title, intro text and two buttons.

### Design Tokens Used
`--font-heading` (page title), `--color-accent` (buttons), `--space-*`.

### Components
| Component | Variant | Notes |
|-----------|---------|-------|
| Page title | "Welcome" | Cursive, `--font-size-xl` |
| Button | "Shop flowers" -> `products.html` | `.button` |
| Button | "See our work" -> `gallery.html` | `.button` |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Button | Hover | Opacity 85% |
| Button | Focus | Accent outline |

### Responsive Behavior
Content is a single column on all sizes; buttons wrap on narrow screens.

### Edge Cases
- Intro text is placeholder: keep under ~200 characters.
- Future: add hero image and featured products (needs content).

### Accessibility Notes
Page `<h2>` follows the site `<h1>`. Buttons are real links.
