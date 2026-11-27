## Handoff Spec: Order form, Venčić (`pages/order-vencic.html`)

### Overview
Order form for Venčić S / M / L. Opened from the products page as `order-vencic.html?product=Venčić M`. The order is sent to the server (`POST /api/orders`), which saves it and e-mails the owner and the buyer.

### Layout
Big page title = product name; the size letter is lowercase ("Venčić m"). Then, in a single column, in this order:
1. **Base** (radio, one of): "Izaberite osnovu venčića:"
2. **Colors** (checkboxes, up to 2): "Izaberite boju detalja na venčiću (maksimalno 2 boje):"
3. **Buyer details**: "Vaši podaci:" with Ime i prezime, Email, Telefon (all required).
4. **Pickup or delivery**: "Da li želite lično preuzimanje ili dostavu?" with radios "Lično preuzimanje" / "Dostava". The field "Adresa za dostavu" appears (and is required) only for "Dostava".
5. **Date**: "Datum preuzimanja / dostave:" (date input). Earlier than today + 48 h is blocked. Note under it: "Za pripremu narudžbine potrebno je najmanje 48 sati."
6. `.button-row`: "Nazad na proizvode" (link to `products.html`) and "Pošalji porudžbinu" (submit).
7. Status message under the buttons, large (`--font-size-highlight`, bold).

Questions 3-5 are added by `js/order-details.js`, shared with the Ikebana form.

### Design Tokens Used
`--color-surface`, `--color-border`, `--color-accent`, `--radius`, `--font-size-highlight`, `--space-*`. Styles: `css/order.css`.

### Components
| Component | Notes |
|-----------|-------|
| Option card | Photo on top, name below. A clickable `<label>`; the native radio/checkbox is invisible but focusable. Photos: `images/order/<category>-<value>.jpg`; a missing photo leaves an empty frame |
| Option list | Loaded from `GET /api/options` by `js/stock.js`; colors and bases are managed in the database (admin page "Zalihe") |
| Date input | `min` = today + 48 h (`MIN_PREPARATION_HOURS` in `js/order-details.js`) |

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Option card | Selected | Accent border and ring |
| Option card | Unavailable (switched off or quantity 0) | Disabled, greyed out (40% opacity), cannot be chosen |
| Color cards | 2 chosen | The other colors become disabled; unchecking one frees them |
| Delivery | "Dostava" chosen | Address field appears and becomes required |
| Submit | No color / no base | Message "Izaberite bar jednu boju." / "Izaberite osnovu." |
| Submit | Date too early | Message "Izaberite datum koji je najmanje 48 sati od danas." |
| Submit | Server refuses | The server's Serbian message is shown; entered values are kept; options reload |
| Submit | Server cannot be reached | "Server nije dostupan. Pokušajte ponovo kasnije." |
| Submit | Accepted | "Hvala! Vaša porudžbina je primljena."; form clears; options reload so a color that just ran out greys out |
| Page | Options cannot load | "Opcije trenutno nisu dostupne. Pokušajte kasnije." |

### Server checks (`validateOrder` in `server/server.js`)
Known product; 1-2 colors and (for Venčić) a base, all in stock; name, valid e-mail, phone; pickup or delivery; address for delivery; date at least 48 h ahead (Serbian time). An order uses `UNITS_PER_ORDER` of each chosen color and base, saved together with the order in one transaction.

### Responsive Behavior
Option cards in an auto-fill grid (min 150px): about 6 per row on desktop, 2 on phones. Form fields max 500px wide. Buttons wrap on narrow screens.

### Edge Cases
- Opened without `?product=`: title stays "Venčić"; the server refuses the order (unknown product).
- Two buyers want the last unit: the second gets "Neka od izabranih opcija je upravo rasprodata..." and the options reload.
- A buyer who leaves the page open does not see other people's orders until they submit or reload.
- Prices are not shown or saved yet.

### Accessibility Notes
Each question is a `<fieldset>` with a `<legend>`. Keyboard focus shows a ring on the whole card (`:has(input:focus-visible)`). The status message uses `role="status"`.
