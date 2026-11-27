// Order page for ikebana (Ikebana S / M / L). Nothing is sent yet: it only shows a thank-you.
// Colors come from the server (js/stock.js); out-of-stock ones are greyed out.
const MAX_COLORS = 2;

// Builds one option: a photo above a label, with a checkbox or radio button.
function optionHtml(type, name, option) {
  return `
    <label class="option">
      <input type="${type}" name="${name}" value="${option.value}"${option.available ? "" : " disabled data-out"}>
      <span class="option-photo"><img src="${option.image}" alt="${option.label}" loading="lazy"></span>
      <span class="option-label">${option.label}</span>
    </label>`;
}

function renderOptions(containerId, type, name, options) {
  document.querySelector(`#${containerId} .option-grid`).innerHTML = options
    .map((o) => optionHtml(type, name, o))
    .join("");
}

// Photos that are not added yet simply stay as an empty frame.
document.addEventListener(
  "error",
  (e) => { if (e.target.tagName === "IMG" && e.target.closest(".option-photo")) e.target.hidden = true; },
  true
);

const productName = new URLSearchParams(location.search).get("product");
if (productName) {
  // "Ikebana S" -> "Ikebana s" (size letter in lowercase)
  const lastSpace = productName.lastIndexOf(" ");
  document.getElementById("product-title").textContent =
    lastSpace > 0
      ? productName.slice(0, lastSpace + 1) + productName.slice(lastSpace + 1).toLowerCase()
      : productName;
  document.title = `${productName} | Jasna Flower Studio`;
}

const form = document.getElementById("order-form");
const status = document.getElementById("form-status");

// Loads colors from the server and draws them. Picks the buyer already made are kept,
// unless that color has meanwhile run out. Called on page load and after every order attempt.
async function refreshOptions() {
  const picked = [...form.querySelectorAll('input[name="color"]:checked')].map((input) => input.value);
  renderOptions("color-options", "checkbox", "color", await loadOptions("color"));
  for (const value of picked) {
    const input = form.querySelector(`input[name="color"][value="${value}"]:not(:disabled)`);
    if (input) input.checked = true;
  }
  updateColorLimit();
}

refreshOptions().catch(() => { status.textContent = "Opcije trenutno nisu dostupne. Pokušajte kasnije."; });

// Out-of-stock colors stay disabled; once 2 colors are picked, the remaining ones are disabled too.
function updateColorLimit() {
  const boxes = form.querySelectorAll('input[name="color"]');
  const chosen = form.querySelectorAll('input[name="color"]:checked').length;
  boxes.forEach((box) => { box.disabled = "out" in box.dataset || (chosen >= MAX_COLORS && !box.checked); });
}
form.addEventListener("change", (e) => { if (e.target.name === "color") updateColorLimit(); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.querySelector('input[name="color"]:checked')) {
    status.textContent = "Izaberite bar jednu boju.";
    return;
  }
  const order = {
    product: productName,
    colors: [...form.querySelectorAll('input[name="color"]:checked')].map((box) => box.value),
    ...readOrderDetails(form),
  };
  try {
    await sendOrder(order);
  } catch (error) {
    status.textContent = error.message;
    refreshOptions().catch(() => {});   // the refusal may be because something just ran out
    return;
  }
  status.textContent = "Hvala! Vaša porudžbina je primljena.";
  form.reset();
  refreshOptions().catch(() => {});     // show what is left now (the order may have used the last unit)
});
