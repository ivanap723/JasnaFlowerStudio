// Products page: shows the product list and filters it by the ?q= search term.
// Placeholder data: replace with a real API/database later.
const PRODUCTS = [
  { name: "Spring Bouquet", price: 35, description: "Tulips, ranunculus and eucalyptus." },
  { name: "Red Roses (12)", price: 45, description: "Classic long-stem roses." },
  { name: "Wedding Centerpiece", price: 80, description: "Seasonal blooms in a ceramic vase." },
  { name: "Dried Flower Wreath", price: 55, description: "Long-lasting, handmade." },
  { name: "Orchid Plant", price: 40, description: "Potted phalaenopsis orchid." },
  { name: "Sunflower Bunch", price: 25, description: "Bright and cheerful." },
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
        <button class="button" type="button">Add to cart</button>
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
