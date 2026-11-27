# Jasna Flower Studio

Portfolio and online store for a flower studio: a plain HTML/CSS/JS front end plus a small Node + SQLite back end for orders, stock, admin and e-mails. No build step.
Run `npm start` and open http://localhost:3000 to view it (it forwards to `pages/index.html`).

## Goals
- Readable, simple, easy-to-maintain code: the owner plans to extend it (cart, payment, more pages).
- Dark green background on every page, cursive headings, elegant serif body text.
- Responsive: phones, tablets, desktop.
- The site is in Serbian (Latin script). Use Serbian for everything visitors and the admin see.

## Structure
### Website
- `pages/`: all HTML pages. They load `../css/`, `../js/` and `../images/`.
  - Public: `index.html`, `gallery.html`, `products.html`, `services.html`, `workshops.html`, `contact.html`.
  - Detail pages: `order-vencic.html`, `order-ikebana.html` (order forms), `service-decor-consulting.html`, `workshop-signup.html`.
  - Admin (password protected): `admin-orders.html`, `admin-stock.html`, `admin-emails.html`.
- `css/tokens.css`: design tokens (colors, fonts, sizes, spacing) and the Google Fonts import. Change look here first.
- `css/base.css`: shared styles (buttons, cards, grid, big page titles).
- `css/layout.css`: site title (shining) and menu bar.
- `css/home.css`, `css/gallery.css`, `css/order.css`, `css/admin.css`: page-specific styles.
- `js/layout.js`: renders the shared title, menu and search on every page (`MENU_ITEMS` lists the pages).
- `js/glitter.js`: falling glitter that trails the mouse cursor on every page.
- `js/gallery.js`: carousels (`CAROUSELS`: title, folder, count) plus the enlarged-photo lightbox.
- `js/products.js`: product list (`PRODUCTS`, with `orderPage` for products that can be ordered) and search filtering (`?q=term`).
- `js/stock.js`: loads colors/bases and their availability from `/api/options` (shared by the order pages).
- `js/order-details.js`: adds buyer details, pickup/delivery and date (min. 48 h ahead) to an order form and sends the order (`sendOrder`).
- `js/order-vencic.js`, `js/order-ikebana.js`: the two order forms (Venčić has a base question, Ikebana does not).
- `js/contact.js`, `js/workshop-signup.js`: forms that only show a thank-you; nothing is sent yet.
- `js/admin-common.js`, `js/admin-orders.js`, `js/admin-stock.js`, `js/admin-emails.js`: the admin pages.
- `images/gallery/<folder>/1.jpg ... N.jpg`: gallery photos. `images/bouquet.png`: home page picture. `images/order/<category>-<value>.jpg`: option photos on the order forms (e.g. `color-crvena.jpg`, `base-jelka.jpg`).
- `specs/*.spec.md`: one design handoff spec per page, plus `shared-layout.spec.md` and `admin.spec.md`.

### Server (`server/`)
- `server.js`: Express app. Public API: `GET /api/options`, `POST /api/orders` (validates everything again on the server). Serves ONLY `pages/`, `css/`, `js/`, `images/` as the website; never serve the project folder (it holds the database and code). `/` forwards to `/pages/index.html`.
- `admin.js`: admin login (HTTP Basic, user `admin`, password `ADMIN_PASSWORD`) and `/api/admin/*`: orders list, order status changes, stock editing, e-mail log.
- `email.js`: e-mails through Resend, plus the e-mail log. The wording of the buyer e-mails is in `statusMessage`.
- `db.js`: SQLite file `server/data.db` (not committed). Tables: `options` (colors/bases: `available` switch + `quantity`), `orders`, `emails` (log, entries older than 90 days are deleted automatically). Uses Node's built-in `node:sqlite`.
- Settings are in `.env` (not committed): `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL` (where "new order" mails to the owner go), `ADMIN_PASSWORD`, and later `BUYER_EMAIL_FROM` (see below). Restart the server after changing server code or `.env`.

## How orders work
- A buyer fills an order form. The server checks input, stock and the 48 h minimum, saves the order as `pending`, subtracts `UNITS_PER_ORDER` (1) of each chosen color and base, e-mails the owner, and e-mails the buyer.
- Statuses: `pending` (Na čekanju) -> `ready` (Spremna) -> `completed` (Završena); `pending`/`ready` -> `cancelled` (Otkazana, gives the stock back). Completed and cancelled are final. Each status change e-mails the buyer.
- An option is orderable only if `available = 1` and `quantity >= UNITS_PER_ORDER`. Order forms re-load the options after every order attempt.
- Buyer e-mails need a verified domain in Resend. Until `BUYER_EMAIL_FROM` is set in `.env`, they are only recorded in the e-mail log with the result "mock" (not sent). Setting it makes the same code send real e-mails.
- Never put text typed by buyers into HTML unescaped (`escapeHtml` in `server/email.js` and `js/admin-common.js`).

## Conventions
- Use tokens from `css/tokens.css` instead of hard-coded values.
- Keep one responsibility per file; keep specs in `specs/` updated when a page changes.
- Respect `prefers-reduced-motion` for animations.
- The product list exists in two places and must stay in sync: `js/products.js` and `ORDERABLE_PRODUCTS` in `server/server.js`.

## Open items
- Prices are stored only in `js/products.js`; they are not saved with orders. Cart and online payment do not exist yet.
- Contact form and workshop signup need a backend (they only show a thank-you).
- Buyer e-mails are not really sent until a domain is verified in Resend (`BUYER_EMAIL_FROM`).
- The admin login needs HTTPS when the site goes online.
- E-mails have no logo or illustration yet.
- Gallery photo alt text is generic ("Weddings, photo 3").
- `npm run dev` (Vite) no longer opens a home page; use `npm start`.

## Working rules
### Scope of changes
- Only change what was explicitly asked for.
- Never make additional changes (refactors, renames, formatting, new features, dependency updates) unless asked.
- If you notice something else worth changing, mention it instead of doing it.

### Responsiveness
- All pages must be responsive and display correctly on mobile phones, tablets and desktops.
- They must work in different browsers (Chrome, Firefox, Safari, Edge).
- Apply this to every new page and component.
