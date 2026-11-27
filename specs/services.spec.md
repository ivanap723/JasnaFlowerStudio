## Handoff Spec: Services (`pages/services.html`)

### Overview
Lists what the studio offers. Currently one service: "Konsultacije o dekoru poslovnog prostora", which has its own page.

### Layout
`.grid` with one `.card.product-card`: title (`<h3>`), short description (placeholder "Opis uskoro."), "Saznaj više" button at the bottom center.

### Design Tokens Used
`--color-surface`, `--color-text-muted`, `--space-md`.

### Components
| Component | Notes |
|-----------|-------|
| Service card | Title, description, "Saznaj više" link to `service-decor-consulting.html` |

### States and Interactions
"Saznaj više" opens the service page. No other interactions.

### Responsive Behavior
Grid reflows to 1 column on narrow screens.

### Edge Cases
- Descriptions: keep under ~120 characters so cards stay even.
- Adding a service: copy the `<section class="card product-card">` and its own page.

### Accessibility Notes
Each card is a `<section>` with its own heading.

---

## Handoff Spec: Service page (`pages/service-decor-consulting.html`)

### Overview
Describes the decor consulting service for business premises: a highlighted intro sentence, two paragraphs explaining how it works (phone call or e-mail first, then a meeting at the client's office).

### Layout
Page title (cursive, normal size), intro in `.text-highlight`, two paragraphs, then a `.button-row`.

### Components
| Component | Notes |
|-----------|-------|
| "Nazad na usluge" | Link to `services.html` |
| "Pošalji upit na mejl" | Link to `contact.html` (the contact form) |

### Responsive Behavior
Buttons wrap onto separate lines on narrow screens.

### Edge Cases
- There is a stray closing `</p>` after the second paragraph in the file. It is harmless but should be removed when the page is next edited.
