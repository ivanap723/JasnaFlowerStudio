// Admin page "Zalihe": set the quantity of each color/base and switch it on or off.
// Every change is saved right away.
const stockStatus = document.getElementById("admin-status");

function renderStock(options) {
  for (const category of ["color", "base"]) {
    document.getElementById(`stock-${category}`).innerHTML = options
      .filter((o) => o.category === category)
      .map(
        (o) => `
        <li class="stock-item">
          <span class="stock-name">${escapeHtml(o.label)}</span>
          <label>Količina
            <input type="number" min="0" step="1" inputmode="numeric" value="${o.quantity}"
                   data-field="quantity" data-category="${o.category}" data-value="${o.value}">
          </label>
          <label class="stock-switch">
            <input type="checkbox" data-field="available" data-category="${o.category}" data-value="${o.value}"${o.available ? " checked" : ""}>
            Dostupno
          </label>
        </li>`
      )
      .join("");
  }
}

async function loadStock() {
  renderStock(await adminRequest("/api/admin/options"));
}

document.addEventListener("change", async (e) => {
  const input = e.target;
  if (!input.dataset.field) return;

  const body = input.dataset.field === "quantity" ? { quantity: Number(input.value) } : { available: input.checked };
  stockStatus.textContent = "Čuvanje…";
  try {
    await adminRequest(`/api/admin/options/${input.dataset.category}/${input.dataset.value}`, "PUT", body);
    stockStatus.textContent = "Sačuvano.";
  } catch (error) {
    stockStatus.textContent = error.message;
  }
  loadStock().catch(() => {});   // show what the server really has (also undoes a rejected value)
});

loadStock().catch(() => { stockStatus.textContent = "Nije moguće učitati zalihe."; });
