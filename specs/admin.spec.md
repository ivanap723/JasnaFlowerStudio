## Handoff Spec: Admin area (`pages/admin-orders.html`, `admin-stock.html`, `admin-emails.html`)

### Overview
For the shop owner only. Password protected; not linked from the site menu. Open `http://localhost:3000/pages/admin-orders.html`; the browser asks for a login (user `admin`, password = `ADMIN_PASSWORD` in `.env`). Without `ADMIN_PASSWORD` the area stays locked (503). Source: `server/admin.js`, `js/admin-*.js`, `css/admin.css`.

### Layout
Page title, then a navigation row of three buttons (Porudžbine, Zalihe, E-Mailovi; the current one is darker), then the page content. Lists and cards use the menu font (`--font-menu`) at normal size for readability.

### Page: Porudžbine
- Filter "Prikaži:" by status (Sve, Na čekanju, Spremne, Završene, Otkazane).
- One card per order, newest first: number, product, status tag, colors, base, buyer (clickable e-mail and phone), pickup/delivery with address, wanted date, time placed (Serbian time).
- Buttons per status: Na čekanju -> "Označi kao spremnu", "Otkaži"; Spremna -> "Označi kao završenu", "Otkaži"; Završena and Otkazana have none (final).
- "Otkaži" asks for confirmation and gives the order's material back to the stock.
- Every status change sends the buyer an e-mail (see below). The message under the filter says whether it was sent ("Kupcu je poslat e-mail.") or only recorded in probni režim.

### Page: Zalihe
- Two lists, "Boje detalja" and "Osnove". Each row: name, a number box "Količina", and a switch "Dostupno". Every change saves immediately.
- An option is shown to buyers only if it is switched on AND the quantity is at least 1. Each order subtracts from the quantity.

### Page: E-Mailovi
- Log of every e-mail the server sent or tried to send (owner and buyers), newest first. Each row: time, kind, order number, recipient, result tag. Click a row to see the subject, the full text and any error.
- Result tags: "Poslat", "Nije poslat (probni režim)", "Nije poslat (greška)".
- Filters: period (30 or 90 days), result, order number. Entries older than 90 days are deleted automatically.

### E-mails (server/email.js)
| When | To | Subject |
|------|----|---------|
| Order placed | Owner (`ORDER_NOTIFY_EMAIL`) | Nova porudžbina: <product> |
| Order placed | Buyer | Primili smo vašu porudžbinu |
| Status Spremna | Buyer | Vaša porudžbina je spremna |
| Status Završena | Buyer | Vaša porudžbina je završena (asks for impressions by reply) |
| Status Otkazana | Buyer | Vaša porudžbina je otkazana |

Buyer e-mails are really sent only when `BUYER_EMAIL_FROM` is set (needs a verified Resend domain); otherwise they only appear in the log as "probni režim".

### States and Edge Cases
- A failed e-mail never blocks an order or a status change; it is logged and the admin message warns about it.
- Not allowed: going back a status, changing a completed or cancelled order (the server refuses).
- Everything buyers typed is escaped before it is shown.
- The login needs HTTPS when the site is online.
- Responsive: cards and rows wrap on narrow screens; buttons are at least 44px high.
