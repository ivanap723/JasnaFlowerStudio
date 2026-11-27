// Web server: serves the website files and the /api endpoints. Start it with: npm start
const express = require("express");
const path = require("path");
const db = require("./db");
const { sendOrderEmail, sendOrderStatusEmail } = require("./email");

const app = express();
const PORT = 3000;
app.use(express.json());   // lets routes read JSON sent by the browser as req.body

// Products that can be ordered, and whether they ask for a base. Keep in sync with js/products.js.
const ORDERABLE_PRODUCTS = {
  "Venčić S": { needsBase: true },
  "Venčić M": { needsBase: true },
  "Venčić L": { needsBase: true },
  "Ikebana S": { needsBase: false },
  "Ikebana M": { needsBase: false },
  "Ikebana L": { needsBase: false },
};
const MAX_COLORS = 2;
const MIN_PREPARATION_HOURS = 48;
const UNITS_PER_ORDER = 1;   // how much of each chosen color / base one order uses up

// Earliest allowed date as yyyy-mm-dd, in Serbian time (the 'sv-SE' format happens to be yyyy-mm-dd).
function earliestOrderDate() {
  const earliest = new Date(Date.now() + MIN_PREPARATION_HOURS * 60 * 60 * 1000);
  return earliest.toLocaleDateString("sv-SE", { timeZone: "Europe/Belgrade" });
}

// True if the option exists, you have not switched it off, and enough units are left.
function isInStock(category, value) {
  const row = db.prepare("SELECT available, quantity FROM options WHERE category = ? AND value = ?").get(category, value);
  return !!row && row.available === 1 && row.quantity >= UNITS_PER_ORDER;
}

class OutOfStockError extends Error {}

// Checks the data sent by the order form. Returns { error } or { order } (cleaned data).
// Never trust the browser: anyone can send anything to this address.
function validateOrder(body) {
  const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

  const product = ORDERABLE_PRODUCTS[body.product];
  if (!product) return { error: "Nepoznat proizvod." };

  const colors = Array.isArray(body.colors) ? [...new Set(body.colors)] : [];
  if (colors.length < 1 || colors.length > MAX_COLORS) return { error: "Izaberite 1 ili 2 boje." };
  if (!colors.every((c) => typeof c === "string" && isInStock("color", c))) {
    return { error: "Neka od izabranih boja nije dostupna." };
  }

  let base = null;
  if (product.needsBase) {
    if (typeof body.base !== "string" || !isInStock("base", body.base)) return { error: "Izabrana osnova nije dostupna." };
    base = body.base;
  }

  const buyer_name = text(body.buyer_name, 100);
  const buyer_email = text(body.buyer_email, 200);
  const buyer_phone = text(body.buyer_phone, 30);
  if (!buyer_name) return { error: "Upišite ime i prezime." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer_email)) return { error: "Upišite ispravan email." };
  if (!/^[0-9+()\/\-\s]{6,30}$/.test(buyer_phone)) return { error: "Upišite ispravan broj telefona." };

  const delivery = body.delivery;
  if (delivery !== "preuzimanje" && delivery !== "dostava") return { error: "Izaberite preuzimanje ili dostavu." };
  const address = delivery === "dostava" ? text(body.address, 200) : null;
  if (delivery === "dostava" && !address) return { error: "Upišite adresu za dostavu." };

  const wanted_date = body.wanted_date;
  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(wanted_date) && !Number.isNaN(Date.parse(wanted_date));
  if (!isRealDate) return { error: "Izaberite datum." };
  if (wanted_date < earliestOrderDate()) return { error: "Izaberite datum koji je najmanje 48 sati od danas." };

  return {
    order: { product: body.product, colors: colors.join(","), base, buyer_name, buyer_email, buyer_phone, delivery, address, wanted_date },
  };
}

// POST /api/orders -> saves a new order with status 'pending'.
app.post("/api/orders", (req, res) => {
  const { error, order } = validateOrder(req.body ?? {});
  if (error) return res.status(400).json({ error });

  // Save the order and use up the stock as ONE unit of work (a transaction): either everything
  // happens or nothing does, so an order can never be saved without its stock being subtracted.
  const used = order.colors.split(",").map((value) => ["color", value]);
  if (order.base) used.push(["base", order.base]);
  const useStock = db.prepare(
    "UPDATE options SET quantity = quantity - ? WHERE category = ? AND value = ? AND available = 1 AND quantity >= ?"
  );
  // The ? marks are filled in separately from the SQL text, so nothing a buyer types can change the query.
  const insertOrder = db.prepare(
    `INSERT INTO orders (product, colors, base, buyer_name, buyer_email, buyer_phone, delivery, address, wanted_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let id;
  db.exec("BEGIN IMMEDIATE");   // take the write lock right away, so nobody else changes stock in between
  try {
    for (const [category, value] of used) {
      // changes === 0 means: unknown option, switched off, or not enough left (checked again, right now).
      if (useStock.run(UNITS_PER_ORDER, category, value, UNITS_PER_ORDER).changes === 0) throw new OutOfStockError();
    }
    const result = insertOrder.run(order.product, order.colors, order.base, order.buyer_name, order.buyer_email,
      order.buyer_phone, order.delivery, order.address, order.wanted_date);
    id = Number(result.lastInsertRowid);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");   // undo every subtraction made so far
    if (err instanceof OutOfStockError) {
      return res.status(409).json({ error: "Neka od izabranih opcija je upravo rasprodata. Osvežite stranicu i izaberite ponovo." });
    }
    throw err;
  }

  // The order is already saved. The email is sent in the background; if it fails, we only log it,
  // so the buyer still gets their confirmation.
  sendOrderEmail(order, id).catch((err) => console.error(`Order #${id}: email not sent. ${err.message}`));
  // The buyer gets "we received your order" (only pretended until BUYER_EMAIL_FROM is set, see server/email.js).
  sendOrderStatusEmail({ ...order, id }, "pending").catch((err) => console.error(`Order #${id}: buyer email not sent. ${err.message}`));

  res.status(201).json({ id });
});

// GET /api/options -> every color/base and whether it is in stock.
app.get("/api/options", (req, res) => {
  const rows = db.prepare("SELECT category, value, label, available, quantity FROM options ORDER BY id").all();
  // Buyers only learn "can I pick it?", never how many units you have.
  res.json(rows.map((r) => ({
    category: r.category, value: r.value, label: r.label,
    available: r.available === 1 && r.quantity >= UNITS_PER_ORDER,
  })));
});

// Admin pages and routes (login required). Must come before the static files below.
app.use(require("./admin")({ unitsPerOrder: UNITS_PER_ORDER }));

// The website itself. ONLY these folders are public: never serve the whole project folder,
// because it also holds the database (server/data.db), the code and your settings.
for (const folder of ["pages", "css", "js", "images"]) {
  app.use(`/${folder}`, express.static(path.join(__dirname, "..", folder)));
}
// The home page lives in pages/, so the bare address forwards there.
app.get("/", (req, res) => res.redirect("/pages/index.html"));

app.listen(PORT, () => console.log(`Site and API running at http://localhost:${PORT}`));
