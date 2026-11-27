## Handoff Spec: Products (`pages/products.html`)

### Overview
Product listing. Also the target of the menu search: `products.html?q=term` filters the list. Each product has a "Naruči" button that leads to its order form.

### Layout
`.grid` of product cards (min 220px). Each card: name, description, price (€), "Naruči" button at the bottom center.

### Design Tokens Used
`--color-surface`, `--color-accent`, `--color-text-muted`, `--space-md`.

### Components
| Component | Props | Notes |
|-----------|-------|-------|
| Product card | `name`, `price`, `description`, `orderPage` | Data in `js/products.js` (`PRODUCTS`): Venčić S/M/L and Ikebana S/M/L |
| Naruči button | `orderPage` | A link to `order-vencic.html` or `order-ikebana.html` with `?product=<name>`. Without `orderPage` it is an inert button |
| Empty state | none | "Nijedan proizvod ne odgovara vašoj pretrazi." |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Search | `?q=ven` | Case-insensitive match on name and description |
| Search | No match | Empty state shown, grid empty |
| Naruči | Click | Opens the order page for that product (see `order-vencic.spec.md`) |

### Responsive Behavior
Grid reflows from 4 columns to 1 as width shrinks.

### Edge Cases
- **Long names**: wrap, no truncation.
- **Price format**: euro, whole numbers. Prices live only here; they are not saved with orders.
- **Adding a product that can be ordered**: also add it to `ORDERABLE_PRODUCTS` in `server/server.js`, or the server refuses its orders.
- **Security**: escape text before inserting it into HTML if data ever comes from a backend.

### Accessibility Notes
Product list is a `<ul>`; each name is an `<h3>`.
