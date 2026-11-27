// Shared by every order page: adds buyer contact details, pickup/delivery choice and the
// wanted date to the order form (just above the buttons). Load it before the page's own order script.
const MIN_PREPARATION_HOURS = 48;   // an order needs at least this long to be prepared

// Today + 48h as yyyy-mm-dd (local time), used as the earliest selectable date.
function earliestOrderDate() {
  const d = new Date(Date.now() + MIN_PREPARATION_HOURS * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Reads the buyer / delivery / date fields that this file adds to the form.
function readOrderDetails(form) {
  const delivery = form.querySelector('input[name="delivery"]:checked');
  return {
    buyer_name: form.elements.buyer_name.value,
    buyer_email: form.elements.buyer_email.value,
    buyer_phone: form.elements.buyer_phone.value,
    delivery: delivery ? delivery.value : "",
    address: form.elements.address.value,
    wanted_date: form.elements.wanted_date.value,
  };
}

// Sends the order to the server. Resolves when it was saved; throws an Error with a message
// (in Serbian) when the server refuses it or cannot be reached.
async function sendOrder(order) {
  let response;
  try {
    response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  } catch {
    throw new Error("Server nije dostupan. Pokušajte ponovo kasnije.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Došlo je do greške. Pokušajte ponovo.");
  }
}

(function addOrderDetails() {
  const form = document.getElementById("order-form");
  const minDate = earliestOrderDate();

  const details = document.createElement("div");
  details.className = "order-details";
  details.innerHTML = `
    <fieldset class="order-question">
      <legend>Vaši podaci:</legend>
      <div class="order-fields">
        <label>Ime i prezime <input type="text" name="buyer_name" autocomplete="name" required></label>
        <label>Email <input type="email" name="buyer_email" autocomplete="email" required></label>
        <label>Telefon <input type="tel" name="buyer_phone" autocomplete="tel" required></label>
      </div>
    </fieldset>

    <fieldset class="order-question">
      <legend>Da li želite lično preuzimanje ili dostavu?</legend>
      <div class="order-fields">
        <label class="choice"><input type="radio" name="delivery" value="preuzimanje" required> Lično preuzimanje</label>
        <label class="choice"><input type="radio" name="delivery" value="dostava"> Dostava</label>
        <label id="address-field" hidden>Adresa za dostavu <input type="text" name="address" autocomplete="street-address"></label>
      </div>
    </fieldset>

    <fieldset class="order-question">
      <legend>Datum preuzimanja / dostave:</legend>
      <div class="order-fields">
        <label><input type="date" name="wanted_date" min="${minDate}" required></label>
        <p class="muted">Za pripremu narudžbine potrebno je najmanje 48 sati.</p>
      </div>
    </fieldset>`;
  form.querySelector(".button-row").before(details);

  const addressField = details.querySelector("#address-field");
  const addressInput = addressField.querySelector("input");

  // The address is only asked for (and required) when the buyer picks delivery.
  function updateAddress() {
    const delivery = form.querySelector('input[name="delivery"]:checked');
    const needsAddress = !!delivery && delivery.value === "dostava";
    addressField.hidden = !needsAddress;
    addressInput.required = needsAddress;
  }
  form.addEventListener("change", (e) => { if (e.target.name === "delivery") updateAddress(); });
  form.addEventListener("reset", () => setTimeout(updateAddress));

  // Safety net for browsers that do not enforce the date minimum themselves.
  form.addEventListener("submit", (e) => {
    const dateInput = form.elements.wanted_date;
    if (dateInput.value && dateInput.value < minDate) {
      e.preventDefault();
      e.stopImmediatePropagation();   // keeps the page script from showing "thank you"
      document.getElementById("form-status").textContent =
        "Izaberite datum koji je najmanje 48 sati od danas.";
    }
  });
})();
