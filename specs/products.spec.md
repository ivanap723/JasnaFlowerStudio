## Handoff Spec: Products (`products.html`)

### Overview
Online store listing. Also the target of the menu search: `products.html?q=term` filters the list.

### Layout
`.grid` of product cards (min 220px). Each card: name, description, price, "Add to cart".

### Design Tokens Used
`--color-surface`, `--color-accent`, `--color-text-muted`, `--space-md`.

### Components
| Component | Props | Notes |
|-----------|-------|-------|
| Product card | `name`, `price`, `description` | Data in `js/products.js` (placeholder `PRODUCTS`) |
| Add to cart button | none | Visual only; cart is a future feature |
| Empty state | none | "No products match your search." |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Search | `?q=rose` | Case-insensitive match on name and description |
| Search | No match | Empty state shown, grid empty |
| Add to cart | Click | No action yet |

### Responsive Behavior
Grid reflows from 4 columns to 1 as width shrinks.

### Edge Cases
- **Long names**: wrap, no truncation.
- **Loading** (future API): skeleton cards.
- **Error** (future API): message with retry button.
- **Price format**: euro, whole numbers for now. Confirm currency.
- **Security**: when data comes from a backend, escape text before inserting into HTML.

### Accessibility Notes
Product list is a `<ul>`; each name is an `<h2>`. Add product name to cart button `aria-label` once it works.
