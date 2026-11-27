// Admin page "Porudžbine": lists orders and changes their status.
const STATUS_LABELS = { pending: "Na čekanju", ready: "Spremna", completed: "Završena", cancelled: "Otkazana" };

// Buttons shown for each status: [new status, button text]. Mirrors ALLOWED_STATUS_CHANGES in server/admin.js.
const STATUS_ACTIONS = {
  pending: [["ready", "Označi kao spremnu"], ["cancelled", "Otkaži"]],
  ready: [["completed", "Označi kao završenu"], ["cancelled", "Otkaži"]],
  completed: [],
  cancelled: [],
};

const orderList = document.getElementById("order-list");
const statusFilter = document.getElementById("status-filter");
const adminStatus = document.getElementById("admin-status");

let orders = [];
let optionLabels = {};   // "color:roze" -> "Roze"

// 2026-12-05 -> 05.12.2026.
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}.`;
}

// The server stores times in UTC ("2026-11-27 07:53:49"); show them in Serbian time.
function formatPlacedAt(utcText) {
  return new Date(utcText.replace(" ", "T") + "Z").toLocaleString("sr-Latn-RS", { timeZone: "Europe/Belgrade" });
}

function orderHtml(order) {
  const colors = order.colors.split(",").map((value) => optionLabels[`color:${value}`] || value).join(", ");
  const base = order.base ? optionLabels[`base:${order.base}`] || order.base : null;
  const rows = [
    ["Boje detalja", escapeHtml(colors)],
    base ? ["Osnova", escapeHtml(base)] : null,
    ["Kupac", escapeHtml(order.buyer_name)],
    ["Email", `<a href="mailto:${escapeHtml(order.buyer_email)}">${escapeHtml(order.buyer_email)}</a>`],
    ["Telefon", `<a href="tel:${escapeHtml(order.buyer_phone)}">${escapeHtml(order.buyer_phone)}</a>`],
    ["Preuzimanje / dostava", order.delivery === "dostava" ? "Dostava" : "Lično preuzimanje"],
    order.address ? ["Adresa", escapeHtml(order.address)] : null,
    ["Željeni datum", formatDate(order.wanted_date)],
    ["Poručeno", formatPlacedAt(order.created_at)],
  ].filter(Boolean);

  const buttons = (STATUS_ACTIONS[order.status] || [])
    .map(([newStatus, text]) =>
      `<button class="button" type="button" data-id="${order.id}" data-status="${newStatus}">${text}</button>`)
    .join("");

  return `
    <article class="card order-card">
      <h3 class="card-title">#${order.id} ${escapeHtml(order.product)}
        <span class="order-status order-status-${escapeHtml(order.status)}">${STATUS_LABELS[order.status] || escapeHtml(order.status)}</span>
      </h3>
      <dl class="order-info">
        ${rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("")}
      </dl>
      ${buttons ? `<div class="button-row">${buttons}</div>` : ""}
    </article>`;
}

function renderOrders() {
  const wanted = statusFilter.value;
  const shown = orders.filter((order) => !wanted || order.status === wanted);
  orderList.innerHTML = shown.length ? shown.map(orderHtml).join("") : '<p class="muted">Nema porudžbina.</p>';
}

async function loadOrders() {
  [orders, optionLabels] = await Promise.all([
    adminRequest("/api/admin/orders"),
    adminRequest("/api/options").then((all) => Object.fromEntries(all.map((o) => [`${o.category}:${o.value}`, o.label]))),
  ]);
  renderOrders();
}

statusFilter.addEventListener("change", renderOrders);

// One listener for every status button in the list.
orderList.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-status]");
  if (!button) return;
  const newStatus = button.dataset.status;
  if (newStatus === "cancelled" && !confirm("Otkazati porudžbinu? Materijal se vraća na stanje.")) return;

  adminStatus.textContent = "Čuvanje…";
  try {
    const result = await adminRequest(`/api/admin/orders/${button.dataset.id}/status`, "PUT", { status: newStatus });
    const emailNotes = {
      sent: " Kupcu je poslat e-mail.",
      mock: " E-mail kupcu nije poslat (probni režim, pogledajte stranicu E-Mailovi).",
      failed: " Pažnja: e-mail kupcu nije poslat.",
    };
    adminStatus.textContent = "Sačuvano." + (emailNotes[result.email] || "");
  } catch (error) {
    adminStatus.textContent = error.message;
  }
  loadOrders().catch(() => {});   // always show what the server has now
});

loadOrders().catch(() => { adminStatus.textContent = "Nije moguće učitati porudžbine."; });
