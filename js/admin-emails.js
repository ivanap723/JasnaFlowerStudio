// Admin page "E-Mailovi": the log of every email the server sent (or pretended to send).
const KIND_LABELS = {
  owner_new_order: "Nova porudžbina (vama)",
  pending: "Porudžbina primljena (kupcu)",
  ready: "Porudžbina spremna (kupcu)",
  completed: "Porudžbina završena (kupcu)",
  cancelled: "Porudžbina otkazana (kupcu)",
};
const RESULT_LABELS = { sent: "Poslat", mock: "Nije poslat (probni režim)", failed: "Nije poslat (greška)" };

const emailList = document.getElementById("email-list");
const periodFilter = document.getElementById("period-filter");
const resultFilter = document.getElementById("result-filter");
const orderFilter = document.getElementById("order-filter");
const emailStatus = document.getElementById("admin-status");

let emails = [];

// The server stores times in UTC ("2026-11-27 07:53:49"); show them in Serbian time.
function formatTime(utcText) {
  return new Date(utcText.replace(" ", "T") + "Z").toLocaleString("sr-Latn-RS", { timeZone: "Europe/Belgrade" });
}

function emailHtml(email) {
  return `
    <details class="card email-card">
      <summary>
        <span class="email-time">${formatTime(email.created_at)}</span>
        <span class="email-kind">${escapeHtml(KIND_LABELS[email.kind] || email.kind)}${email.order_id ? ` · #${email.order_id}` : ""}</span>
        <span class="email-to">${escapeHtml(email.recipient)}</span>
        <span class="order-status email-result-${escapeHtml(email.result)}">${escapeHtml(RESULT_LABELS[email.result] || email.result)}</span>
      </summary>
      <p class="email-subject"><strong>Naslov:</strong> ${escapeHtml(email.subject)}</p>
      ${email.error ? `<p class="email-error"><strong>Greška:</strong> ${escapeHtml(email.error)}</p>` : ""}
      <pre class="email-body">${escapeHtml(email.body)}</pre>
    </details>`;
}

function renderEmails() {
  const result = resultFilter.value;
  const orderId = Number(orderFilter.value);
  const shown = emails.filter((e) => (!result || e.result === result) && (!orderId || e.order_id === orderId));
  emailList.innerHTML = shown.length ? shown.map(emailHtml).join("") : '<p class="muted">Nema e-mailova.</p>';
}

async function loadEmails() {
  emails = await adminRequest(`/api/admin/emails?days=${periodFilter.value}`);
  renderEmails();
}

periodFilter.addEventListener("change", () => loadEmails().catch(() => { emailStatus.textContent = "Nije moguće učitati e-mailove."; }));
resultFilter.addEventListener("change", renderEmails);
orderFilter.addEventListener("input", renderEmails);

loadEmails().catch(() => { emailStatus.textContent = "Nije moguće učitati e-mailove."; });
