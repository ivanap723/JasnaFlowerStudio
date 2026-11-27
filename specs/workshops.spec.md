## Handoff Spec: Workshops (`pages/workshops.html`)

### Overview
Lists upcoming workshops. Currently one: "Napravi svoju novogodišnju ikebanu!". Its "Saznaj više" button opens the signup page.

### Layout
Big faded page title "Radionice", then a `.grid` with one `.card.product-card`: title, "Broj mesta: 6", "Lokacija: Zrenjanin", "Kotizacija: 25€" (bold), "Saznaj više" button at the bottom center. Spacing between the detail lines is tightened with a small `<style>` block on the page.

### Design Tokens Used
`--color-surface`, `--color-text-muted`, `--space-xs`, `--space-md`.

### Components
| Component | Notes |
|-----------|-------|
| Workshop card | Title, places, location, fee, link to `workshop-signup.html` |

### Responsive Behavior
Grid reflows to 1 column on narrow screens.

### Edge Cases
- The number of places (6) is written by hand here and on the signup page; keep them equal. Places are not counted down by signups yet.

---

## Handoff Spec: Workshop signup (`pages/workshop-signup.html`)

### Overview
Description of the workshop and a signup form. Front-end only: submit shows a thank-you, nothing is sent or saved yet.

### Layout
Page title (cursive, normal size) = workshop name. Muted line "Broj mesta: 6 · Lokacija: Zrenjanin · Kotizacija: 25€", three description paragraphs ("Sav materijal je obezbeđen." is the last), then the form (max width 500px).

### Components
| Component | Notes |
|-----------|-------|
| Ime i prezime | Text, required |
| Email | E-mail, required, format validated by the browser |
| Telefon | Tel, required |
| "Nazad na radionice" | Link to `workshops.html` |
| "Prijavi se" | Submit |
| Status line | `role="status"` |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Form | Invalid submit | Native browser message |
| Form | Valid submit | Form resets, "Hvala na prijavi! Javićemo vam se uskoro." shown |

### Edge Cases
- Needs a backend to store signups and count the free places (same approach as orders). Until then nobody receives the signups.
