// Sends emails through Resend (https://resend.com) and keeps a log of every email in the database
// (table "emails", shown in the admin page "Emailovi").
// Settings come from the .env file: RESEND_API_KEY, ORDER_NOTIFY_EMAIL and (later) BUYER_EMAIL_FROM.
const db = require("./db");

// While you have no verified domain, Resend only allows this test sender, and only to your own address.
const FROM = "Jasna Flower Studio <onboarding@resend.dev>";

// Log entries older than this are deleted automatically.
const LOG_RETENTION_DAYS = 90;

// Text typed by buyers must never be put into HTML as it is, or it could inject its own HTML.
function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "boja value" -> the name buyers saw (e.g. 'zuta' -> 'Žuta'); falls back to the value itself.
function labelFor(category, value) {
  const row = db.prepare("SELECT label FROM options WHERE category = ? AND value = ?").get(category, value);
  return row ? row.label : value;
}

// 2026-12-05 -> 05.12.2026.
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}.`;
}

// ---- Email log ----

// Saves one line in the email log. kind: 'owner_new_order', 'pending', 'ready', 'completed' or 'cancelled'.
// result: 'sent' (handed to Resend), 'mock' (pretend mode, nothing sent) or 'failed'.
// A problem with the log must never stop an order, so errors here are only printed.
function logEmail({ orderId, kind, recipient, subject, body, result, error = null }) {
  try {
    db.prepare(
      "INSERT INTO emails (order_id, kind, recipient, subject, body, result, error) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(orderId, kind, recipient, subject, body, result, error);
  } catch (err) {
    console.error(`Could not write the email log: ${err.message}`);
  }
}

// Deletes log entries older than LOG_RETENTION_DAYS.
function pruneEmailLog() {
  try {
    db.prepare("DELETE FROM emails WHERE created_at < datetime('now', ?)").run(`-${LOG_RETENTION_DAYS} days`);
  } catch (err) {
    console.error(`Could not clean the email log: ${err.message}`);
  }
}
pruneEmailLog();                                               // when the server starts...
setInterval(pruneEmailLog, 24 * 60 * 60 * 1000).unref();       // ...and once a day while it runs

// Hands one email to Resend. Throws when Resend refuses it.
async function postToResend(message) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!response.ok) throw new Error(`Resend refused the email (${response.status}): ${await response.text()}`);
}

// ---- Email to the shop owner: a new order arrived ----

// The lines of the email as [label, value] pairs, so the text and HTML versions stay identical.
function orderLines(order, id) {
  const lines = [
    ["Porudžbina br.", `#${id}`],
    ["Proizvod", order.product],
    ["Boje detalja", order.colors.split(",").map((c) => labelFor("color", c)).join(", ")],
  ];
  if (order.base) lines.push(["Osnova", labelFor("base", order.base)]);
  lines.push(
    ["Ime i prezime", order.buyer_name],
    ["Email", order.buyer_email],
    ["Telefon", order.buyer_phone],
    ["Preuzimanje / dostava", order.delivery === "dostava" ? "Dostava" : "Lično preuzimanje"]
  );
  if (order.address) lines.push(["Adresa za dostavu", order.address]);
  lines.push(["Željeni datum", formatDate(order.wanted_date)]);
  return lines;
}

// Sends the email. Resolves when Resend accepted it; throws when it did not. Either way it is logged.
async function sendOrderEmail(order, id) {
  const lines = orderLines(order, id);
  const text = lines.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html =
    "<h2>Nova porudžbina</h2><table cellpadding=\"4\">" +
    lines.map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("") +
    "</table>";
  const subject = `Nova porudžbina: ${order.product}`;

  const to = process.env.ORDER_NOTIFY_EMAIL;
  const entry = { orderId: id, kind: "owner_new_order", recipient: to || "(nije podešeno u .env)", subject, body: text };
  try {
    if (!process.env.RESEND_API_KEY || !to) throw new Error("RESEND_API_KEY or ORDER_NOTIFY_EMAIL is missing in .env");
    await postToResend({
      from: FROM,
      to: [to],
      reply_to: order.buyer_email,   // pressing "Reply" in your mail app writes to the buyer
      subject,
      text,
      html,
    });
  } catch (err) {
    logEmail({ ...entry, result: "failed", error: err.message });
    throw err;
  }
  logEmail({ ...entry, result: "sent" });
}

// ---- Emails to the BUYER, one for each order status ----
//   pending (order received), ready, completed (with a request for a review), cancelled.
// Sending to buyers needs a verified domain. Until you have one, leave BUYER_EMAIL_FROM out of .env:
// the email is then only PRETENDED: it appears in the email log (result "mock") and nothing is sent.
// Once your domain is verified in Resend, add to .env, for example:
//   BUYER_EMAIL_FROM=Jasna Flower Studio <narudzbine@yourdomain.rs>
// and the same code sends real emails.

// The wording of each email: { subject, lines }. Edit the texts here.
function statusMessage(order, status) {
  const pickup = order.delivery === "preuzimanje";
  const when = formatDate(order.wanted_date);
  const where = pickup ? "Lično preuzimanje" : `Dostava na adresu: ${order.address}`;
  const about = `Porudžbina #${order.id} (${order.product})`;

  const messages = {
    pending: {
      subject: "Primili smo vašu porudžbinu",
      lines: [
        "Hvala vam na porudžbini! Uspešno smo je primili.",
        "",
        `${about}`,
        `${where}`,
        `Željeni datum: ${when}`,
        "",
        "Obavestićemo vas čim porudžbina bude spremna.",
      ],
    },
    ready: {
      subject: "Vaša porudžbina je spremna",
      lines: [
        `Vaša porudžbina #${order.id} (${order.product}) je spremna!`,
        pickup
          ? `Možete je preuzeti dana ${when}.`
          : `Isporučićemo je dana ${when} na adresu: ${order.address}.`,
      ],
    },
    completed: {
      subject: "Vaša porudžbina je završena",
      lines: [
        `Vaša porudžbina #${order.id} (${order.product}) je ${pickup ? "preuzeta" : "isporučena"} i time zatvorena.`,
        "",
        "Zahvaljujemo vam se na ukazanom poverenju i nadamo se da ste zadovoljni.",
        "Bićemo vam zahvalni ako nam odgovorite na ovaj mejl i podelite svoje utiske, bilo pozitivne ili negativne. Vaše mišljenje nam mnogo znači.",
      ],
    },
    cancelled: {
      subject: "Vaša porudžbina je otkazana",
      lines: [`Vaša porudžbina #${order.id} (${order.product}) je otkazana.`],
    },
  };
  return messages[status];
}

// Emails the buyer about their order. status: "pending", "ready", "completed" or "cancelled".
// Returns "sent" (handed to Resend) or "mock" (pretend mode). Either way it is logged; a failure is logged and thrown.
async function sendOrderStatusEmail(order, status) {
  const message = statusMessage(order, status);
  if (!message) throw new Error(`No email text for status "${status}"`);

  const lines = [
    `Zdravo ${order.buyer_name},`,
    "",
    ...message.lines,
    "",
    "Ako imate bilo kakvo pitanje, samo odgovorite na ovaj mejl.",
    "",
    "Jasna Flower Studio",
  ];
  const text = lines.join("\n");
  const html = lines.map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "")).join("");
  const entry = { orderId: order.id, kind: status, recipient: order.buyer_email, subject: message.subject, body: text };

  const from = process.env.BUYER_EMAIL_FROM;
  if (!from) {
    logEmail({ ...entry, result: "mock" });
    return "mock";
  }

  try {
    await postToResend({
      from,
      to: [order.buyer_email],
      reply_to: process.env.ORDER_NOTIFY_EMAIL,   // the buyer's reply reaches you
      subject: message.subject,
      text,
      html,
    });
  } catch (err) {
    logEmail({ ...entry, result: "failed", error: err.message });
    throw err;
  }
  logEmail({ ...entry, result: "sent" });
  return "sent";
}

module.exports = { sendOrderEmail, sendOrderStatusEmail, escapeHtml };
