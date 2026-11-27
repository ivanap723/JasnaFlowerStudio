// Database: one SQLite file (server/data.db), created automatically on first run.
// Uses Node's built-in sqlite module, so there is nothing extra to install.
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "data.db"));

// Tables are created only if they do not exist yet, so this is safe to run every start.
db.exec(`
  CREATE TABLE IF NOT EXISTS options (
    id        INTEGER PRIMARY KEY,
    category  TEXT NOT NULL,              -- 'color' or 'base'
    value     TEXT NOT NULL,              -- short id used by the forms
    label     TEXT NOT NULL,              -- name shown to buyers
    available INTEGER NOT NULL DEFAULT 1, -- 1 = you allow it, 0 = greyed out (your manual switch)
    quantity  INTEGER NOT NULL DEFAULT 10, -- units left; each order subtracts, 0 = greyed out
    UNIQUE (category, value)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY,
    product        TEXT NOT NULL,                       -- e.g. 'Venčić M'
    colors         TEXT NOT NULL,                       -- chosen color values, comma separated
    base           TEXT,                                -- chosen base (NULL for products without one)
    buyer_name     TEXT NOT NULL,
    buyer_email    TEXT NOT NULL,
    buyer_phone    TEXT NOT NULL,
    delivery       TEXT NOT NULL,                       -- 'preuzimanje' (pickup) or 'dostava' (delivery)
    address        TEXT,                                -- only for delivery
    wanted_date    TEXT NOT NULL,                       -- yyyy-mm-dd, at least 48h after ordering
    status         TEXT NOT NULL DEFAULT 'pending',     -- 'pending' -> 'ready' -> 'completed'
    created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP  -- when the order was placed (UTC)
  );

  -- Log of every email the server sent (or pretended to send). Old rows are deleted after 90 days.
  CREATE TABLE IF NOT EXISTS emails (
    id          INTEGER PRIMARY KEY,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- UTC
    order_id    INTEGER,                                  -- which order it was about
    kind        TEXT NOT NULL,   -- 'owner_new_order', 'pending', 'ready', 'completed' or 'cancelled'
    recipient   TEXT NOT NULL,
    subject     TEXT NOT NULL,
    body        TEXT NOT NULL,   -- the full text of the email
    result      TEXT NOT NULL,   -- 'sent', 'mock' (pretend mode, not sent) or 'failed'
    error       TEXT             -- why it failed
  );
`);

// A database created before "quantity" existed: add the column (existing rows get the default of 10).
const optionColumns = db.prepare("PRAGMA table_info(options)").all();
if (!optionColumns.some((column) => column.name === "quantity")) {
  db.exec("ALTER TABLE options ADD COLUMN quantity INTEGER NOT NULL DEFAULT 10");
}

// Starting data (same lists the order pages have now). INSERT OR IGNORE keeps your later edits.
const seed = [
  ["color", "crvena", "Crvena"], ["color", "roze", "Roze"], ["color", "bela", "Bela"],
  ["color", "zuta", "Žuta"], ["color", "plava", "Plava"], ["color", "ljubicasta", "Ljubičasta"],
  ["base", "jelka", "Jelka"], ["base", "slama", "Slama"], ["base", "tekstil", "Tekstil"],
];
const insert = db.prepare("INSERT OR IGNORE INTO options (category, value, label) VALUES (?, ?, ?)");
for (const row of seed) insert.run(...row);

module.exports = db;
