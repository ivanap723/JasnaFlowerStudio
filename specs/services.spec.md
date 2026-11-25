## Handoff Spec: Services (`services.html`)

### Overview
Describes what the studio offers: weddings, events, subscriptions, workshops (placeholder copy).

### Layout
`.grid` of four `.card` sections, each with an `<h3>` and short description.

### Design Tokens Used
`--color-surface`, `--color-text-muted`, `--space-md`.

### Components
| Component | Notes |
|-----------|-------|
| Service card | Title + 1-2 sentence description |

### States and Interactions
Static content, no interactions. Future: "Enquire" button linking to `contact.html`.

### Responsive Behavior
Grid reflows from 4 columns to 1.

### Edge Cases
- Descriptions: keep under ~120 characters so cards stay even.
- Adding a service: copy one `<section class="card">`.

### Accessibility Notes
Each card is a `<section>` with its own heading.
