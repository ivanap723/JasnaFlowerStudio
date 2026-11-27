// Admin area: login check, order list + status changes, stock editing.
// Everything here is behind a username/password (HTTP Basic auth built into the browser).
const express = require("express");
const crypto = require("crypto");
const db = require("./db");
const { sendOrderStatusEmail } = require("./email");

// Order status flow. Cancelled and completed are final.
//   pending (Na čekanju) -> ready (Spremna) -> completed (Završena)
//   pending or ready     -> cancelled (Otkazana), which gives the stock back
const ALLOWED_STATUS_CHANGES = {
  pending: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const MAX_QUANTITY = 100000;

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest();
}

// Username is "admin"; the password is ADMIN_PASSWORD from .env. Without a password the admin stays locked.
function requireAdmin(req, res, next) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return res.status(503).send("Admin is locked: set ADMIN_PASSWORD in .env and restart the server.");
  const [scheme, encoded] = (req.headers.authorization || "").split(" ");
  const [user, ...rest] = Buffer.from(encoded || "", "base64").toString().split(":");
  // Compare hashes in constant time, so response timing does not reveal the password.
  const ok = scheme === "Basic" && user === "admin" && crypto.timingSafeEqual(sha256(rest.join(":")), sha256(password));
  if (!ok) {
    res.set("WWW-Authenticate", 'Basic realm="Jasna Flower Studio admin"');
    return res.status(401).send("Login required");
  }
  next();
}

// unitsPerOrder: how much of each color / base one order uses (needed to give stock back on cancel).
function createAdminRouter({ unitsPerOrder }) {
  const router = express.Router();

  // The admin pages and every /api/admin route need the login.
  router.use(
    ["/pages/admin-orders.html", "/pages/admin-stock.html", "/pages/admin-emails.html", "/api/admin"],
    requireAdmin
  );

  // GET /api/admin/orders -> all orders, newest first.
  router.get("/api/admin/orders", (req, res) => {
    res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
  });

  // PUT /api/admin/orders/12/status  { "status": "ready" }
  router.put("/api/admin/orders/:id/status", async (req, res) => {
    const id = Number(req.params.id);
    const newStatus = req.body?.status;

    db.exec("BEGIN IMMEDIATE");
    try {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
      if (!order) {
        db.exec("ROLLBACK");
        return res.status(404).json({ error: "Porudžbina ne postoji." });
      }
      if (!(ALLOWED_STATUS_CHANGES[order.status] || []).includes(newStatus)) {
        db.exec("ROLLBACK");
        return res.status(400).json({ error: "Ova promena statusa nije dozvoljena." });
      }

      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(newStatus, id);

      if (newStatus === "cancelled") {
        // Give back what the order used up. Same list of colors and base as when it was placed.
        const used = order.colors.split(",").map((value) => ["color", value]);
        if (order.base) used.push(["base", order.base]);
        const giveBack = db.prepare("UPDATE options SET quantity = quantity + ? WHERE category = ? AND value = ?");
        for (const [category, value] of used) giveBack.run(unitsPerOrder, category, value);
      }
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    // Tell the buyer about the new status. The status is already saved; if the email fails we say so,
    // but the status stays changed. email is "sent", "mock" (pretend mode) or "failed".
    let email;
    try {
      email = await sendOrderStatusEmail(db.prepare("SELECT * FROM orders WHERE id = ?").get(id), newStatus);
    } catch (err) {
      console.error(`Order #${id}: ${newStatus}-email not sent. ${err.message}`);
      email = "failed";
    }
    res.json({ id, status: newStatus, email });
  });

  // GET /api/admin/emails?days=30 -> the email log, newest first (days: 1 to 90, default 30).
  router.get("/api/admin/emails", (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
    res.json(
      db.prepare("SELECT * FROM emails WHERE created_at >= datetime('now', ?) ORDER BY id DESC").all(`-${days} days`)
    );
  });

  // GET /api/admin/options -> all colors/bases with their quantity (the public list hides quantities).
  router.get("/api/admin/options", (req, res) => {
    const rows = db.prepare("SELECT category, value, label, available, quantity FROM options ORDER BY id").all();
    res.json(rows.map((r) => ({ ...r, available: r.available === 1 })));
  });

  // PUT /api/admin/options/color/roze  { "quantity": 12 }  and/or  { "available": false }
  router.put("/api/admin/options/:category/:value", (req, res) => {
    const { category, value } = req.params;
    const { quantity, available } = req.body ?? {};
    const changes = [];
    const values = [];

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
        return res.status(400).json({ error: "Količina mora biti ceo broj od 0 naviše." });
      }
      changes.push("quantity = ?");
      values.push(quantity);
    }
    if (available !== undefined) {
      if (typeof available !== "boolean") return res.status(400).json({ error: "available mora biti true ili false." });
      changes.push("available = ?");
      values.push(available ? 1 : 0);
    }
    if (changes.length === 0) return res.status(400).json({ error: "Nema šta da se promeni." });

    const result = db
      .prepare(`UPDATE options SET ${changes.join(", ")} WHERE category = ? AND value = ?`)
      .run(...values, category, value);
    if (result.changes === 0) return res.status(404).json({ error: "Nepoznata opcija." });
    res.json({ category, value, quantity, available });
  });

  return router;
}

module.exports = createAdminRouter;
