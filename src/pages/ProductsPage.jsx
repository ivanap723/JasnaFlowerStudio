import { useSearchParams } from "react-router-dom";

// Placeholder data. Later this can come from a backend.
const products = [
  { id: 1, name: "Spring Bouquet", price: 35 },
  { id: 2, name: "Red Roses", price: 45 },
  { id: 3, name: "Wedding Arrangement", price: 120 },
  { id: 4, name: "Potted Orchid", price: 30 },
];

export default function ProductsPage() {
  const [params] = useSearchParams();
  const search = (params.get("search") || "").toLowerCase();
  const visible = products.filter((p) => p.name.toLowerCase().includes(search));

  return (
    <section>
      <h2>Products</h2>
      {search && <p>Results for "{params.get("search")}"</p>}
      {visible.length === 0 && <p>No products found.</p>}
      <ul className="product-list">
        {visible.map((p) => (
          <li key={p.id} className="card">
            <h3>{p.name}</h3>
            <p>€{p.price}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
