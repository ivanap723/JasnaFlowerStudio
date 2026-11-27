// Products page: shows the product list and filters it by the ?q= search term.
// Edit the description and price of each product below.
const PRODUCTS = [
  { name: "Venčić S", price: 20, description: "Prečnik 15cm", orderPage: "order-vencic.html" },
  { name: "Venčić M", price: 30, description: "Prečnik 25cm", orderPage: "order-vencic.html" },
  { name: "Venčić L", price: 40, description: "Prečnik 35cm", orderPage: "order-vencic.html" },
  { name: "Ikebana S", price: 20, description: "Ikebana u čaši", orderPage: "order-ikebana.html" },
  { name: "Ikebana M", price: 30, description: "Okrugla ikebana prečnika 25cm", orderPage: "order-ikebana.html" },
  { name: "Ikebana L", price: 40, description: "Okrugla ikebana prečnika 35cm", orderPage: "order-ikebana.html" },
];

function renderProducts(products) {
  const list = document.getElementById("product-list");
  const empty = document.getElementById("empty-state");
  empty.hidden = products.length > 0;
  list.innerHTML = products
    .map(
      (p) => `
      <li class="card product-card">
        <h3 class="card-title">${p.name}</h3>
        <p class="muted">${p.description}</p>
        <p><strong>€${p.price}</strong></p>
        ${
          p.orderPage
            ? `<a class="button" href="${p.orderPage}?product=${encodeURIComponent(p.name)}">Naruči</a>`
            : `<button class="button" type="button">Naruči</button>`
        }
      </li>`
    )
    .join("");
}

function filterProducts(term) {
  const query = term.trim().toLowerCase();
  return PRODUCTS.filter((p) =>
    (p.name + " " + p.description).toLowerCase().includes(query)
  );
}

const searchTerm = new URLSearchParams(location.search).get("q") || "";
renderProducts(filterProducts(searchTerm));
