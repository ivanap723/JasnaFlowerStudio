// Shared by the admin pages: safe text, server calls, and the little admin navigation.
// The browser sends the admin login automatically (the server asked for it when the page opened).

// Text typed by buyers must never be put into HTML as it is.
function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Calls the server and returns its JSON. Throws an Error with the server's message when it refuses.
async function adminRequest(url, method = "GET", body) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Greška (${response.status})`);
  return data;
}

// Draws the two links at the top of every admin page and marks the current one.
function renderAdminNav() {
  const here = location.pathname.split("/").pop();
  document.getElementById("admin-nav").innerHTML = [
    ["admin-orders.html", "Porudžbine"],
    ["admin-stock.html", "Zalihe"],
    ["admin-emails.html", "E-Mailovi"],
  ]
    .map(([href, label]) => `<a class="button" href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
}
renderAdminNav();
