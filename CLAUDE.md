# Jasna Flower Studio: frontend

Portfolio and online store for a flower studio. Front end only for now (no backend, no build step).
Open `index.html` in a browser to view it.

## Goals
- Readable, simple, easy-to-maintain code: the owner plans to extend it (cart, backend, more pages).
- Dark green background on every page, cursive headings, elegant serif body text.
- Responsive: phones, tablets, desktop.

## Structure
- `index.html`, `gallery.html`, `products.html`, `services.html`, `contact.html`: the five pages.
- `css/tokens.css`: design tokens (colors, fonts, sizes, spacing) and the Google Fonts import. Change look here first.
- `css/base.css`: shared styles (buttons, cards, grid, big page titles).
- `css/layout.css`: site title (shining) and menu bar.
- `css/home.css`, `css/gallery.css`: page-specific styles.
- `js/layout.js`: renders the shared title, menu and search on every page (`MENU_ITEMS` lists the pages).
- `js/glitter.js`: falling glitter that trails the mouse cursor on every page.
- `js/gallery.js`: carousels (`CAROUSELS`: title, folder, count) plus the enlarged-photo lightbox.
- `js/products.js`: placeholder product data and search filtering (`?q=term`).
- `js/contact.js`: contact form (shows a thank-you only; nothing is sent yet).
- `images/gallery/<folder>/1.jpg ... N.jpg`: gallery photos. `images/bouquet.png`: home page picture.
- `specs/*.spec.md`: one design handoff spec per page, plus `shared-layout.spec.md`.

## Conventions
- Use tokens from `css/tokens.css` instead of hard-coded values.
- Keep one responsibility per file; keep specs in `specs/` updated when a page changes.
- Respect `prefers-reduced-motion` for animations.

## Open items
- Product data is placeholder; cart and checkout do not exist yet.
- Contact form needs a backend.
- Gallery photo alt text is generic ("Weddings, photo 3").
- Products, Services and Contact page titles are still in English; Home and Gallery are Serbian.

## Working rules
### Scope of changes
- Only change what was explicitly asked for.
- Never make additional changes (refactors, renames, formatting, new features, dependency updates) unless asked.
- If you notice something else worth changing, mention it instead of doing it.

### Responsiveness
- All pages must be responsive and display correctly on mobile phones, tablets and desktops.
- They must work in different browsers (Chrome, Firefox, Safari, Edge).
- Apply this to every new page and component.


