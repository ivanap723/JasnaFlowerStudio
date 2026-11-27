## Handoff Spec: Order form, Ikebana (`pages/order-ikebana.html`)

### Overview
Order form for Ikebana S / M / L. Opened as `order-ikebana.html?product=Ikebana M`. It works exactly like the Venčić form (see `order-vencic.spec.md`), with these differences.

### Differences from the Venčić form
- No base question. The form starts with the color question: "Izaberite boju detalja na ikebani (maksimalno 2 boje):".
- The title shows "Ikebana s", "Ikebana m" or "Ikebana l" (lowercase size letter).
- Script: `js/order-ikebana.js` (colors only). The server does not ask for a base for Ikebana products (`needsBase: false` in `ORDERABLE_PRODUCTS`).

Everything else is the same: buyer details, pickup or delivery, date at least 48 h ahead, server checks, stock handling, messages, responsive behavior and accessibility.
