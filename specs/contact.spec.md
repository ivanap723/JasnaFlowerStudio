## Handoff Spec: Contact (`pages/contact.html`)

### Overview
Contact form (name, e-mail, message) plus the studio's address and e-mail at the bottom center. Front-end only: submit shows a confirmation, nothing is sent yet.

### Layout
- Intro sentence in `.text-highlight`: "Ako imaš bilo kakve upite, slobodno nam piši!"
- Single column form, max width 500px, gap `--space-md`.
- `<footer class="contact-info">`: centered, pushed to the bottom of the page (the body is a flex column). Lines: "Adresa: Ulica 123, Zrenjanin" and "Email adresa: jasnaflowershop@email.com" (a `mailto:` link). Address and e-mail are placeholders.

### Design Tokens Used
`--color-surface`, `--color-border`, `--color-accent`, `--radius`, `--font-size-highlight`.

### Components
| Component | Props | Notes |
|-----------|-------|-------|
| Text input | `name`, required | Label "Upiši svoje ime:" |
| Email input | `email`, required | Label "Upiši svoj email:"; browser validates format |
| Textarea | `message`, 5 rows, required | Label "Tekst poruke" |
| Send button | submit | "Pošalji mejl" |
| Status line | `role="status"` | Announces result to screen readers |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Form | Invalid submit | Browser shows native required/format message |
| Form | Valid submit | Form resets, "Hvala! Javićemo vam se uskoro." shown |
| Form | Sending (future) | Disable button, show "Sending..." |
| Form | Error (future) | Show error text in status line, keep entered values |

### Responsive Behavior
Form shrinks to full width on mobile.

### Edge Cases
- Long messages: textarea scrolls. Add a character limit (e.g. 2000) when the backend exists.
- Spam: add honeypot or captcha with the backend.
- Studio address, e-mail, phone and map are placeholders or missing. Provide the real ones.

### Accessibility Notes
Each input is wrapped in a `<label>`. Status message uses `role="status"`.
