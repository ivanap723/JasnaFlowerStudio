## Handoff Spec: Contact (`contact.html`)

### Overview
Contact form (name, email, message). Front-end only: submit shows a confirmation, nothing is sent yet.

### Layout
Single column form, max width 500px, gap `--space-md`.

### Design Tokens Used
`--color-surface`, `--color-border`, `--color-accent`, `--radius`.

### Components
| Component | Props | Notes |
|-----------|-------|-------|
| Text input | `name`, required | |
| Email input | `email`, required | Browser validates format |
| Textarea | `message`, 5 rows, required | |
| Send button | submit | |
| Status line | `role="status"` | Announces result to screen readers |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Form | Invalid submit | Browser shows native required/format message |
| Form | Valid submit | Form resets, "Thank you!..." shown |
| Form | Sending (future) | Disable button, show "Sending..." |
| Form | Error (future) | Show error text in status line, keep entered values |

### Responsive Behavior
Form shrinks to full width on mobile.

### Edge Cases
- Long messages: textarea scrolls. Add a character limit (e.g. 2000) when the backend exists.
- Spam: add honeypot or captcha with the backend.
- Studio address, phone and map are not yet specified. Provide them.

### Accessibility Notes
Each input is wrapped in a `<label>`. Status message uses `role="status"`.
